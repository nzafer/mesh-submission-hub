# Mechanical Engineering Submission Hub (MESH)

Offline assignment PDF builder for ESOGU Mechanical Engineering.

MESH can also be hosted online as a static website. The app still builds the PDF in the student's browser, then opens the correct Microsoft OneDrive/SharePoint file-request link for the selected course and week.

## Instructor OneDrive Distribution

1. Put the whole `Mechanical Engineering Submission Hub (MESH)` folder in OneDrive.
2. Share the folder with students, keeping the folder structure intact.
3. Create course/week submission folders in OneDrive separately, for example `ME151815401/Week01`.

## Online Hosting With Azure Static Web Apps

Recommended online setup:

1. Create a private GitHub repository named `mesh-submission-hub`.
2. Upload every file in this folder to that repository.
3. In the Azure portal, create a new Static Web App.
4. Choose GitHub as the deployment source and select the repository.
5. Use these build settings:
   - App location: `/`
   - API location: leave blank
   - Output location: leave blank
6. After Azure deploys the app, open the generated `https://...azurestaticapps.net/` URL and test the full workflow.

The app has no build step and no CDN dependency. Azure only needs to serve the files in this folder.

## Microsoft 365 File-Request Links

Create the destination folders first, for example:

```text
MESH Submissions/
  ME151815356/
    Week01/
    Week02/
  ME151815401/
    Week01/
    Week02/
```

For each final week folder:

1. Open OneDrive for Business or SharePoint in the browser.
2. Select the course/week folder, for example `ME151815356/Week01`.
3. Choose `Request files`.
4. Enter a clear request name such as `ME151815356 Week01 Assignment PDF`.
5. Copy the generated request link.
6. Paste it in `js/config.js` under `SUBMISSION_LINKS`.

Example:

```javascript
ME151815356: {
    Week01: "https://your-university.sharepoint.com/...",
    Week02: "https://your-university.sharepoint.com/..."
}
```

If `Request files` is missing, ask the Microsoft 365 or SharePoint administrator to enable file requests for OneDrive/SharePoint.

## Student Workflow

1. Open the online MESH website, or open `index.html` locally in Microsoft Edge or Google Chrome.
2. Enter student information, including the 12-digit student ID.
3. Select the course and week.
4. Attach assignment pages as JPG, PNG, WEBP, or PDF files.
5. Check the live cover preview and total page count.
6. Export the assignment PDF.
7. Find the exported PDF in the browser's Downloads folder.
8. Click `Open Submission Link`.
9. Upload the generated PDF to the Microsoft file-request page.

Browsers do not allow a static page to silently write a PDF into OneDrive or SharePoint. The app creates the correctly named PDF and opens the correct upload-only request link. The student must choose the generated PDF on the Microsoft upload page.

Microsoft file requests allow students to upload files without seeing, editing, deleting, or downloading files already in the folder. They do not automatically block a student from uploading a second file with a different name. Automatic duplicate blocking would require a backend service, Microsoft Graph, or a Power Automate flow.

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
