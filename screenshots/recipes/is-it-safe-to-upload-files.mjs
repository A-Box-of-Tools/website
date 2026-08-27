/**
 * Is it safe to upload files: the guide about everybody else's tools, and the
 * one thing this site can show rather than claim.
 *
 * So the screenshot is not of a tool doing a job. It is of the panel every tool
 * page carries, which counts the requests the page has made and says so out
 * loud - the claim and its evidence in the same picture.
 */

export const shots = [
  {
    tool: 'resize-image',
    name: 'pledge',
    clip: '.pledge',
    run: async (k) => {
      k.give(await k.photo(2000, 1500));
      await k.wait('#resize-card');
      // Long enough for the live check to have finished counting.
      await k.settle(2500);
    },
  },
];
