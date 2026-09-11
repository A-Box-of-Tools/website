# Contact

One person reads this, and reads all of it. Below is what each of the two ways in is best for, what to include so a bug can actually be found, and what happens after you send it.

Last updated 27 August 2026

## The two ways in

**Email — [hi@abox.tools](mailto:hi@abox.tools).** Goes straight to the person who writes the tools. Best for anything you would rather not say in public: a privacy concern, a copyright or trademark complaint, a security problem, or a bug you can only describe by attaching a file that is nobody else’s business.

**The issue tracker — [github.com/A-Box-of-Tools/website/issues](https://github.com/A-Box-of-Tools/website/issues).** The same person reads it. Best for anything that other people would benefit from seeing: a tool that mishandles a particular kind of file, a translation that reads wrongly in your language, a feature request, or a question whose answer belongs where the next person can find it. It needs a GitHub account; email does not.

There is no telephone number and no live chat. This is a one-person project, and a support line nobody is sitting at is worse than saying so.

## What happens when you write

A person reads it, usually within a few days. Replies are in English.

A reproducible bug in a tool is normally fixed within a week or two, and the fix appears in the public commit history with your report attached to it if you raised it as an issue. A feature request gets an honest answer, which is sometimes no — [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md) keeps a paragraph on each idea that has been turned down and why, so a no here comes with its reasoning.

What will not happen: you will not be added to a mailing list, and your address will not be given to anybody. It is used to answer you and for nothing else.

## Reporting a bug so it can be found

These tools run on your machine rather than on a server, which means there are no logs here to look at. Everything that happened, happened somewhere only you could see. So a report that says which page and what went wrong is worth more here than it is almost anywhere else. The useful details:

- **Which tool**, by its address — there are thirty-six, and several of them do adjacent jobs.
- **The browser and version**, and whether it is a phone. A surprising share of these bugs are one browser’s idea of a video container or an image encoder rather than the tool’s.
- **What the file was** — the format, roughly how big, and where it came from, such as a particular camera or phone. You do not need to send the file. If a small example that shows the problem and is not private happens to exist, it helps enormously; if not, describing it is usually enough.
- **What you expected and what you got.** “It did not work” and “the export was silent” are different bugs with different causes.
- **Anything red in the browser console**, if you know how to open it. Copy the first error rather than a screenshot of all of them.

## Security and privacy reports

Email these rather than posting them: [hi@abox.tools](mailto:hi@abox.tools). Anything that would let a page here reach a file it has no business reaching, send one somewhere, or run code it was not served, is taken seriously and looked at the same week. So is any way the site collects something the [Privacy page](https://abox.tools/privacy/) says it does not.

There is no bug-bounty programme and no money, which is worth saying plainly rather than letting anyone discover it after the work. Credit in the commit and in the release note is offered, and refused just as happily.

## Copyright, trademark and takedown

Nothing on this site is uploaded by users, and there is nowhere here for anyone to publish anything: the tools process files inside the visitor’s own browser, and nothing they open or produce ever reaches this site. So there is no hosted material to take down, and no account to suspend.

If something written or drawn *by this site* — a page, an illustration, a piece of code — infringes a right of yours, write to [hi@abox.tools](mailto:hi@abox.tools) with the address of the page and what on it is at issue, and it will be dealt with directly.

## Advertising and commercial enquiries

The site carries advertising through Google, and that is the whole of the arrangement. Direct ad placements, sponsored posts, paid links, guest articles and link exchanges are all declined, and the reason is not squeamishness — a page that quietly carries somebody else’s copy is a page whose claims a reader cannot weigh, and every claim on this site is one a reader is invited to check. Please save yourself the email.

Using the tools commercially needs no permission and no licence: they are free for any purpose, including inside a business. Reusing the [code](https://github.com/A-Box-of-Tools/website) is governed by the licence in the repository, which is permissive, and lifting a module out of it is exactly what that licence is for.

## Who you are writing to

abox.tools is an independent, self-funded project run by one person from Ontario, Canada. It is not a company, and there is no support department behind the address above — which is why the reply is slower than a company’s and why it is written by somebody who has read the code. The [About page](https://abox.tools/about/) sets out who builds this, why the tools work the way they do, and how the site pays for itself.
