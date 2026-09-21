<#
.SYNOPSIS
  Asks the live site for a page as each crawler that matters, and says which
  of them the edge turned away.

.DESCRIPTION
  robots.txt says everything here is meant to be found, and /llms.txt is a page
  written to language models. Neither decides who gets in. Cloudflare has a
  setting of its own - "Configure AI bot policies", which was "Block AI bots"
  until 15 September 2026, and blocks by default on a zone created since
  mid-2025 - that answers 403 by user agent before robots.txt is ever read, and
  it lives in the dashboard where nothing in this repository can see it. On
  21 September 2026 it was found refusing GPTBot, ClaudeBot, CCBot, Amazonbot,
  Bytespider and cohere-ai - since when, nothing records - while the site went
  on inviting all of them by name.

  That is the same fault response-headers.json exists to prevent - what the
  repository says and what the edge does, free to disagree in silence - except
  that here there is no file to apply, only a switch to look at. So this looks.
  It needs no token and changes nothing.

  WHAT A RESULT MEANS. The request comes from wherever this is run, wearing the
  crawler's user agent, so it tests the rules that match on the user agent and
  nothing else. A 403 here is conclusive: the real crawler sends the same
  header and meets the same rule. A 200 is not: Cloudflare can still challenge
  a crawler on its address or its behaviour, which no impostor can reproduce.
  The dashboard's Security > Events log is the only place that shows what the
  real ones were given.

  WHERE THE SETTING IS. Security > Settings > Configure AI bot policies. It
  sorts AI bots into three kinds and takes an action for each: Search, Agent
  and Training. Those are this script's "answers" (the first two) and "learns",
  and what was found blocked was exactly Training. A single crawler can also be
  blocked from AI Crawl Control > Security > Crawlers, which does it by writing
  a WAF custom rule - so a crawler refused while its kind is allowed is there,
  or under Security > Security rules. Whether to let every one of these in is
  the owner's decision, not this script's; it reports against the policy the
  site has published, which is "all of them".

.PARAMETER Domain
  The site to ask.

.PARAMETER Path
  The address to ask for. /llms.txt by default: it is small, it is the page the
  crawlers in question were told to read, and it is never cached differently
  per language.

.EXAMPLE
  .\cloudflare\check-crawlers.ps1
#>

[CmdletBinding()]
param(
  [string] $Domain = "abox.tools",
  [string] $Path   = "/llms.txt"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "cf-api.ps1")

# Each user agent as its operator publishes it, since a rule may match on more
# than the name. "Learns" is a crawler that gathers text a model is trained on,
# which is how a model comes to know this site exists without looking it up;
# "answers" is one that fetches a page while somebody is asking about it, which
# is how the site gets cited. Blocking the first kind costs nothing today and
# is invisible for a year. Google-Extended and Applebot-Extended are not here:
# they are robots.txt tokens, not user agents, and never make a request.
$crawlers = @(
  @{ Name = "GPTBot";           Does = "learns";  Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)" },
  @{ Name = "ClaudeBot";        Does = "learns";  Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  @{ Name = "CCBot";            Does = "learns";  Agent = "CCBot/2.0 (https://commoncrawl.org/faq/)" },
  @{ Name = "Amazonbot";        Does = "learns";  Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)" },
  @{ Name = "meta-externalagent"; Does = "learns"; Agent = "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)" },
  @{ Name = "Bytespider";       Does = "learns";  Agent = "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)" },
  @{ Name = "cohere-ai";        Does = "learns";  Agent = "cohere-ai" },
  @{ Name = "OAI-SearchBot";    Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" },
  @{ Name = "ChatGPT-User";     Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)" },
  @{ Name = "Claude-SearchBot"; Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com)" },
  @{ Name = "Claude-User";      Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +claudebot@anthropic.com)" },
  @{ Name = "PerplexityBot";    Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" },
  @{ Name = "Perplexity-User";  Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)" },
  @{ Name = "DuckAssistBot";    Does = "answers"; Agent = "DuckAssistBot/1.2; (+http://duckduckgo.com/duckassistbot.html)" },
  @{ Name = "MistralAI-User";   Does = "answers"; Agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-User/1.0; +https://docs.mistral.ai/robots)" },
  @{ Name = "Googlebot";        Does = "search";  Agent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  @{ Name = "bingbot";          Does = "search";  Agent = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" }
)

$url = "https://$Domain$Path"
Write-Step "Asking $url as each crawler"

# A browser first. If that is refused too, the site is down or this network is
# blocked, and seventeen more 403s would say nothing about crawlers.
$browser = Get-EdgeAnswer $url "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
if ($browser.Status -ne 200) {
  Write-Host ("  A browser gets {0} {1}- nothing about crawlers can be read from that." -f $browser.Status, $browser.Note) -ForegroundColor Yellow
  exit 2
}

$refused = @()
foreach ($crawler in $crawlers) {
  $answer = Get-EdgeAnswer $url $crawler.Agent
  if ($answer.Status -eq 200) {
    Write-Host ("  ok       {0,-19} {1}" -f $crawler.Name, $crawler.Does) -ForegroundColor Green
  } else {
    Write-Host ("  REFUSED  {0,-19} {1,-8} {2} {3}" -f $crawler.Name, $crawler.Does, $answer.Status, $answer.Note) -ForegroundColor Red
    $refused += $crawler
  }
}

if ($refused.Count -eq 0) {
  Write-Host "`nNo crawler was turned away by its user agent." -ForegroundColor Green
  Write-Host "That is all an impostor can show - see Security > Events for the real ones."
  exit 0
}

Write-Host "`n$($refused.Count) crawler(s) refused, while robots.txt and /llms.txt invite them." -ForegroundColor Yellow
Write-Host "No rule in this repository does that. In the Cloudflare dashboard, look at"
Write-Host "Security > Settings > Configure AI bot policies (the action for Training, if"
Write-Host "the refused ones all say 'learns'), then AI Crawl Control > Security > Crawlers,"
Write-Host "then Security > Security rules for a custom rule that matches on the user agent."
exit 1
