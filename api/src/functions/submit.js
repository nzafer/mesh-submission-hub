const { app } = require("@azure/functions");

const COURSE_CODES = new Set([
    "151816355",
    "151813560",
    "151816357",
    "151815356"
]);

function json(status, body) {
    return {
        status,
        headers: {
            "Content-Type": "application/json"
        },
        jsonBody: body
    };
}

function header(request, name) {
    return request.headers.get(name) || request.headers.get(name.toLowerCase()) || "";
}

function requiredSetting(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing Azure app setting: ${name}`);
    }
    return value;
}

function decodeHeaderValue(value) {
    try {
        return decodeURIComponent(value || "");
    } catch (error) {
        return value || "";
    }
}

function cleanFilename(value) {
    return String(value || "")
        .replace(/[\\/:*?"<>|]+/g, "")
        .replace(/\s+/g, "_")
        .trim();
}

function encodePath(path) {
    return String(path || "")
        .split("/")
        .filter(Boolean)
        .map(segment => encodeURIComponent(segment))
        .join("/");
}

async function getGraphToken() {
    const tenantId = requiredSetting("MESH_TENANT_ID");
    const body = new URLSearchParams({
        client_id: requiredSetting("MESH_CLIENT_ID"),
        client_secret: requiredSetting("MESH_CLIENT_SECRET"),
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
    });

    const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Microsoft identity token request failed: ${response.status} ${details}`);
    }

    const payload = await response.json();
    if (!payload.access_token) {
        throw new Error("Microsoft identity token response did not include an access token.");
    }
    return payload.access_token;
}

async function resolveDriveId(token) {
    const configuredDriveId = process.env.MESH_DRIVE_ID;
    if (configuredDriveId) {
        return configuredDriveId;
    }

    const driveOwner = process.env.MESH_DRIVE_OWNER;
    if (!driveOwner) {
        throw new Error("Missing Azure app setting: MESH_DRIVE_ID or MESH_DRIVE_OWNER");
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(driveOwner)}/drive`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (error) {
        payload = { raw: text };
    }

    if (!response.ok || !payload.id) {
        const graphMessage = payload.error?.message || payload.raw || "Unknown Microsoft Graph response.";
        throw new Error(`Unable to resolve OneDrive for ${driveOwner}. Make sure OneDrive is provisioned and Graph admin consent is granted. Microsoft Graph: ${response.status} ${graphMessage}`);
    }

    return payload.id;
}

async function uploadToGraph({ token, driveId, folderPath, filename, body }) {
    const path = `${encodePath(folderPath)}/${encodeURIComponent(filename)}`;
    const url = `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(driveId)}/root:/${path}:/content?@microsoft.graph.conflictBehavior=fail`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/pdf"
        },
        body
    });

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (error) {
        payload = { raw: text };
    }

    return {
        ok: response.ok,
        status: response.status,
        payload
    };
}

app.http("submit", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const contentType = header(request, "content-type").toLowerCase();
            if (!contentType.includes("application/pdf")) {
                return json(415, {
                    ok: false,
                    message: "Only generated PDF submissions are accepted."
                });
            }

            const course = header(request, "x-mesh-course").replace(/\D/g, "");
            const week = header(request, "x-mesh-week").replace(/\D/g, "").padStart(2, "0");
            const studentId = header(request, "x-mesh-student-id").replace(/\D/g, "");
            const studentName = decodeHeaderValue(header(request, "x-mesh-student-name")).trim();
            const filename = cleanFilename(header(request, "x-mesh-filename"));

            if (!COURSE_CODES.has(course)) {
                return json(400, {
                    ok: false,
                    message: "Unknown course code."
                });
            }
            if (!/^\d{12}$/.test(studentId)) {
                return json(400, {
                    ok: false,
                    message: "Student ID must contain exactly 12 digits."
                });
            }
            if (!/^Week\d{2}$/i.test(`Week${week}`) || Number(week) < 1 || Number(week) > 14) {
                return json(400, {
                    ok: false,
                    message: "Week must be between 01 and 14."
                });
            }
            if (filename !== `${studentId}_${course}_Week${week}.pdf`) {
                return json(400, {
                    ok: false,
                    message: "Submission filename does not match the required course/week/student format."
                });
            }

            const maxUploadMB = Number(process.env.MESH_MAX_UPLOAD_MB || 60);
            const arrayBuffer = await request.arrayBuffer();
            const body = Buffer.from(arrayBuffer);
            if (!body.length) {
                return json(400, {
                    ok: false,
                    message: "Submission PDF is empty."
                });
            }
            if (body.length > maxUploadMB * 1024 * 1024) {
                return json(413, {
                    ok: false,
                    message: `Submission is larger than ${maxUploadMB} MB.`
                });
            }

            const token = await getGraphToken();
            const driveId = await resolveDriveId(token);
            const folderPath = process.env[`MESH_FOLDER_${course}`] || course;
            const upload = await uploadToGraph({
                token,
                driveId,
                folderPath,
                filename,
                body
            });

            if (upload.status === 409 || upload.status === 412) {
                return json(409, {
                    ok: false,
                    message: "A submission with this filename already exists.",
                    filename,
                    course,
                    week
                });
            }

            if (!upload.ok) {
                context.error("Microsoft Graph upload failed", upload.status, upload.payload);
                return json(502, {
                    ok: false,
                    message: "Microsoft Graph rejected the OneDrive upload.",
                    status: upload.status
                });
            }

            return json(201, {
                ok: true,
                filename,
                course,
                week,
                studentId,
                studentName,
                itemId: upload.payload.id || "",
                webUrl: upload.payload.webUrl || ""
            });
        } catch (error) {
            context.error(error);
            return json(500, {
                ok: false,
                message: error.message || "Unable to submit to OneDrive."
            });
        }
    }
});
