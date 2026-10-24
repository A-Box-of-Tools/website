# Where do your file copies go?

Local processing describes what happens inside the tool. The copies you save, sync and share have their own destinations. Follow one harmless handout to see where those boundaries are.

最后更新 22 October 2026

## Start with one harmless file

Local processing describes where a tool works on your file. Your browser's save location, cloud-sync software and backup settings determine what happens to the saved output afterwards. Closing the tool does not manage those copies for you. The [guide to processing uploads](https://abox.tools/zh/guides/is-it-safe-to-upload-files/) explains that first boundary; this guide follows the saved files.

Imagine `workshop-handout.pdf`, containing a fictional timetable and a drawing. You export a smaller version as `workshop-handout-small.pdf`, then copy that result into a folder for the event. You have an original, a downloaded export and another saved copy before considering any backup.

Use a similarly harmless file to learn your setup. The aim is to know where useful copies live, which accounts or devices can reach them, and which intermediate files have finished their job.

## Locate the downloaded output

Find the exported file in your file manager and note its full folder location. Do not infer its location from the filename or from the fact that the browser opened it.

Chrome lets you choose a default download folder or ask for a destination each time. Its default is normally the user's Downloads folder, but settings can change that. Google's [download documentation](https://support.google.com/chrome/answer/95759?hl=en) distinguishes the browser's record from the file: removing an entry from download history leaves the saved file on the computer.

For the example, record `Downloads/workshop-handout-small.pdf`. If you copied it elsewhere, record that second location separately. Open both files before deciding that either is redundant.

## Check whether the destination folder syncs

A folder visible in your file manager may also be connected to a cloud account. Check its actual location and the sync application's settings rather than assuming that Documents means a file exists only on this computer.

OneDrive can back up selected folders and make their contents available on other devices. Microsoft's [folder-backup documentation](https://support.microsoft.com/en-us/onedrive/back-up-your-folders-with-onedrive) explains how to see which folders are included. This applies when the feature is configured; it does not mean every Documents folder is automatically synced.

Suppose the event folder is inside a Documents folder backed up to OneDrive. Add the cloud account to your inventory. Check any sharing arrangements too: knowing where a file exists and knowing who can access it are separate questions.

## Make a small copy inventory

Record what you have actually found, and mark uncertain locations for checking. Your setup may have fewer or more entries than this example.

| Location and copy | Decision to make |
| --- | --- |
| Project folder: original handout | Keep if needed for later changes |
| Downloads: smaller export | Review after checking the chosen event copy |
| Event folder: checked export | Keep as the working event copy |
| Cloud account: synced folder, if enabled | Check account and sharing access |
| Backup: earlier versions, if captured | Check its purpose and retention |
| Recycle bin or trash: deleted exports, if retained | Review only the relevant items |

Matching names do not establish that two files contain the same version. Check the content and identify the copy you intend to use before removing an intermediate export.

## Include backups and earlier versions

Backups exist so that losing or changing a working file need not lose its contents permanently. That is useful protection, and it means an older version can remain available after you replace the current one.

Windows File History can save versions to an external drive or network location when configured. Microsoft explains its coverage and recovery behaviour in [Backup and restore with File History](https://support.microsoft.com/en-us/windows/experience/backup-recovery/backup-and-restore-with-file-history).

Check which folders your backup covers and how long it keeps versions. Record that information rather than deleting backup folders to tidy one document. A backup may contain the only recoverable copy of unrelated work. On a managed computer, use the organisation's process for changing retention or removing records.

## Understand what a removal action changes

Different actions affect different locations. In OneDrive, making a file online-only removes its downloaded contents from the device while preserving the cloud file. Deleting a synced file can affect the cloud and other synced devices. Microsoft's [Files On-Demand documentation](https://support.microsoft.com/en-us/onedrive/save-disk-space-with-onedrive-files-on-demand-for-windows) explains those differences. Check the action before using it to manage a copy.

Deleted files may remain recoverable. OneDrive has its own recycle bin, and retention depends on account type and settings; a cloud-only file need not appear in the computer's recycle bin. See Microsoft's [deleted-file recovery guidance](https://support.microsoft.com/en-us/onedrive/restore-your-onedrive-files).

Removing a file from one visible folder establishes only what happened in that location. It does not establish that separate exports, backups or copies already shared with someone else have disappeared.

## Choose what to keep, then verify it

For the workshop example, keep the source needed for future editing and the checked event copy. Review the spare download after confirming that the retained export opens correctly. Keep useful backups under their intended retention policy, and leave uncertain items alone until you understand them.

- Open the file chosen to keep and confirm its contents.
- Check its folder, cloud account and sharing arrangements.
- Remove only specific copies whose purpose has ended, after checking the effect of that action.
- Record any backup or other location still needing investigation.

For your next export, choose its destination deliberately and give it a clear filename. Repeat this check when the task finishes, while you remember which files were originals, experiments and final outputs.
