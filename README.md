# Mechanical Engineering Submission Hub (MESH)

Assignment PDF builder and submission hub for ESOGU Mechanical Engineering.

MESH builds the assignment PDF in the student's browser. When hosted on GitHub Pages or opened locally, it can open Microsoft file-request links for manual upload. When hosted on Azure Static Web Apps with the included API and Microsoft Graph settings, it can submit the generated PDF directly to OneDrive/SharePoint course folders.

## Online Hosting With GitHub Pages

Use this option if an Azure subscription is not available.

1. Open the GitHub repository `https://github.com/nzafer/mesh-submission-hub`.
2. Go to `Settings`.
3. Open `Pages`.
4. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Click `Save`.
6. Wait for GitHub Pages to publish the site.

The student link will be:

```text
https://nzafer.github.io/mesh-submission-hub/
```

## Instructor OneDrive Distribution

1. Put the whole `Mechanical Engineering Submission Hub (MESH)` folder in OneDrive.
2. Share the folder with students, keeping the folder structure intact.
3. Create course submission folders in OneDrive separately, for example `151816357`.

## Online Hosting With Azure Static Web Apps

Recommended online setup:

1. Create a private GitHub repository named `mesh-submission-hub`.
2. Upload every file in this folder to that repository.
3. In the Azure portal, create a new Static Web App.
4. Choose GitHub as the deployment source and select the repository.
5. Use these build settings:
   - App location: `/`
   - API location: `api`
   - Output location: leave blank
6. After Azure deploys the app, open the generated `https://...azurestaticapps.net/` URL and test the full workflow.

The frontend has no build step and no CDN dependency. Azure serves the files in this folder and deploys the `api` folder as managed Azure Functions for direct OneDrive submission.

## Direct OneDrive Submission With Azure

Direct submission requires Azure because browser-only pages cannot keep Microsoft Graph secrets safe. Store these values as Azure Static Web App application settings, not in GitHub:

```text
MESH_TENANT_ID
MESH_CLIENT_ID
MESH_CLIENT_SECRET
MESH_DRIVE_ID
MESH_DRIVE_OWNER
MESH_FOLDER_151816355
MESH_FOLDER_151813560
MESH_FOLDER_151816357
MESH_FOLDER_151815356
MESH_MAX_UPLOAD_MB
```

Set either `MESH_DRIVE_ID` or `MESH_DRIVE_OWNER`. For this deployment the intended OneDrive owner is:

```text
MESH_DRIVE_OWNER=nzafer@ogu.edu.tr
```

The owner account must have OneDrive provisioned before direct submission can work.

The `MESH_FOLDER_...` values are folder paths inside the target drive, for example:

```text
151816355
151813560
151816357
151815356
```

The Microsoft Entra app registration must have Microsoft Graph application permission to upload to the target OneDrive/SharePoint location, with administrator consent. Use the least privilege your administrator can grant, such as a SharePoint site-scoped permission when available. The API rejects duplicate filenames so a second upload of the same `StudentID_Course_WeekXX.pdf` is not accepted.

## Microsoft 365 File-Request Links

Create the destination folders first, for example:

```text
MESH Submissions/
  151816355/
  151813560/
  151816357/
  151815356/
```

On this computer, the prepared local synced folder is:

```text
%OneDrive%\MESH Submissions
```

For each final course folder:

1. Open OneDrive for Business or SharePoint in the browser.
2. Select the course folder, for example `151815356`.
3. Choose `Request files`.
4. Enter a clear request name such as `151815356 Assignment PDFs`.
5. Copy the generated request link.
6. Paste it in `js/config.js` under `SUBMISSION_LINKS`.

Use `submission-links-template.csv` to collect all course links before importing them into the app.

## Course Selector Labels

English:

```text
151816355 Control Systems
151813560 Dynamics
151816357 Makine Dinamiği
151815356 Mechanism Design
```

Turkish:

```text
151816355 Kontrol Sistemleri
151813560 Dinamik
151816357 Makine Dinamiği
151815356 Mekanizma Tekniği
```

Example:

```javascript
151816355: "https://your-university.sharepoint.com/...",
151813560: "https://your-university.sharepoint.com/...",
151816357: "https://your-university.sharepoint.com/...",
151815356: "https://your-university.sharepoint.com/..."
```

If `Request files` is missing, ask the Microsoft 365 or SharePoint administrator to enable file requests for OneDrive/SharePoint.

## Student Workflow

1. Open the online MESH website, or open `index.html` locally in Microsoft Edge or Google Chrome.
2. Use the top-right language button to switch between English and Turkish if needed.
3. Enter student information, including the 12-digit student ID.
4. Select the course and week.
5. Attach assignment pages as JPG, PNG, WEBP, or PDF files.
6. Check the live cover preview and total page count.
7. Click `Submit to OneDrive`.
8. On Azure with Graph settings enabled, the PDF is uploaded directly.
9. On GitHub Pages/local/offline mode, the app saves the PDF and opens the Microsoft file-request page for manual upload.

Browsers do not allow a static page to silently write a PDF into OneDrive or SharePoint. Direct submission requires the Azure API in this repository plus Microsoft Graph application settings. The filename includes the week number.

Microsoft file requests allow students to upload files without seeing, editing, deleting, or downloading files already in the folder. The Azure API adds duplicate filename blocking for direct submissions.

On phones, students may need to download or sync the folder locally and open `index.html` in the browser. If OneDrive only previews the HTML file, use a computer browser or open the local synced file directly.

## Local Development Server

From this folder:

```powershell
.\start-server.bat
```

Then open:

```text
http://localhost:8000/
```

If the port is busy, run:

```powershell
python -m http.server 8001
```

## Offline Dependencies

All browser libraries are stored in `libs/`; the app does not use CDN scripts at runtime.

## Output

The final PDF filename is:

```text
StudentID_Course_WeekXX.pdf
```

The PDF contains an A4 cover page plus the uploaded assignment pages fitted to A4 with a footer on each assignment page.
