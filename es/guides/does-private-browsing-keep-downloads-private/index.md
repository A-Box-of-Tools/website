# Does private browsing keep downloaded files private?

Closing every private window ends that private session. What happens to a downloaded document depends on the browser, its settings and where you saved it. Check those separately before using a shared device.

Última actualización 22 October 2026

## A private session and a saved file have different lifetimes

Imagine downloading a draft event budget on a shared computer. You close the private window and the page disappears. That tells you the window has closed; it does not tell you who can open the budget from the computer's folders.

Keep three questions separate: what the browser remembers about the session, where the downloaded file is stored, and whether another application or service has a copy. Clearing one does not establish that the others are clear. This guide focuses on desktop browsers and a harmless check to perform before handling a real document.

## Check what your browser actually clears

A download-history entry is the browser's record of a download. The downloaded file is the saved document or image. Removing the entry and removing the file are separate operations.

- **Chrome Incognito:** the session ends when all Incognito windows close. Chrome removes that session's cookies and site data, while downloaded files remain on the device until deleted. See [Google's Incognito guidance](https://support.google.com/chrome/answer/95464?hl=en).
- **Microsoft Edge InPrivate:** closing all InPrivate windows clears session data, including download history. Saved downloads remain available. Microsoft documents both behaviours in [its InPrivate guidance](https://support.microsoft.com/en-us/edge/browse-inprivate-in-microsoft-edge).
- **Firefox Private Browsing:** Firefox offers a choice to retain or delete private-session downloads when the session ends. Check the download preference in your installed browser; do not assume either outcome. Mozilla describes this choice in the [Firefox 143 release notes](https://www.firefox.com/en-US/firefox/143.0/releasenotes/).

A retained file can expose information, while a cleanup setting can remove a file you expected to keep. Verify the behaviour with something disposable before depending on it.

## Signing in still identifies you to the service

If you sign into a document service inside a private window, the service knows which account you are using. Private browsing does not turn an account action into an anonymous one. Mozilla explains this in its [private browsing guidance](https://support.mozilla.org/en-US/kb/common-myths-about-private-browsing).

For the event-budget example, closing the browser does not mean the service's original document has disappeared. Treat the online document and the downloaded copy as separate items. Sign out of the website when finished and close every private window you opened.

Private browsing also does not make activity invisible to websites or the organisations providing your network. [Google's guidance](https://support.google.com/chrome/answer/95464?hl=en) describes this limit. Use private mode for the session separation it provides, with a separate decision about whether the device and service suit your task.

## Look at the destination folder

Before downloading, identify the actual save location. A file in a folder accessible to another person using the computer can remain readable regardless of which window created it. A filename such as `event-budget-draft.pdf` can itself reveal the subject.

Check whether the destination is synced. Saving inside a OneDrive folder can sync the file to the cloud; Microsoft's [OneDrive documentation](https://support.microsoft.com/en-us/onedrive/sync-your-computer-s-files-and-folders-with-onedrive) explains how file changes in the folder sync with the service. Closing a private window does not control that separate application.

Account for copies you deliberately create too: another export, an email attachment, or a saved version in a desktop editor. Check each destination rather than assuming the browser owns every copy. Whether a tool uploads files for processing is another question; see the [guide to processing uploads](https://abox.tools/es/guias/es-seguro-subir-archivos/).

## Try the workflow with a dummy file

Use an image or document containing only fictional test material. This exercise checks observable behaviour on your computer; it is not a test of secure erasure.

1. Note which browser you are using. In Firefox, inspect the private-download preference so you know which result to expect.
2. Open a private window and confirm that the browser indicates private mode. Run the intended file workflow with dummy material.
3. Explicitly download the result to a folder you can locate again. Give it a recognisable test name and wait for the download to finish. Viewing a document in a tab is not the same check as saving it.
4. Open the destination folder in the operating system's file manager and confirm that the test file is present.
5. Finish any other work in the private session, then close all its private windows. Return to that same folder and check whether the test file remains and can be opened.

If it remains, the file outlived the session. If it disappears, you observed cleanup for this file and configuration. That does not establish what happened to copies in another folder or service. Remove your disposable test output when finished.

## Choose the workflow before using a real file

Decide where the necessary copy should live and who should have access. Prefer a device and operating-system account whose access you control. If you cannot establish a suitable place to save the document on a shared machine, postpone that part of the task or use another device.

Afterwards, review the source, final download and intermediate exports separately. Delete unwanted copies through the relevant system, following any retention rules that apply to your work. A file moved to a trash folder may remain recoverable there; for example, [Apple documents that Mac Trash retains items until it is emptied](https://support.apple.com/en-ie/guide/mac-help/mchlp1093/mac). Ordinary cleanup is not guaranteed erasure of every copy.

The useful outcome is a deliberate saved-file decision: you know which document remains, where it lives, and whether that location is appropriate. An empty browser history cannot answer those questions.
