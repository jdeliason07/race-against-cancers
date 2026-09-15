# Apple Pay domain verification

`apple-developer-merchantid-domain-association` is Stripe's domain association
file, downloaded from
`https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association`.

Apple will not let a site show the Apple Pay button until it can fetch this file
over HTTPS, without a redirect, at
`https://<domain>/.well-known/apple-developer-merchantid-domain-association`.
Everything in `public/` is served verbatim, so committing it here is what makes
that URL work — locally, on preview deploys, and in production.

Hosting the file is only half of it: each domain also has to be registered once
in the Stripe Dashboard under **Settings → Payments → Payment method domains**
(add `raceagainstcancers.org`, plus any preview domain you want to test on).
Stripe fetches this file to verify the domain, and Apple Pay stays invisible
until that check passes. See "Apple Pay and Google Pay" in the root README.

It is the same file for every Stripe account — it carries Stripe's PSP id, not
ours, and no secret — so it is safe in version control. Re-download it if Stripe
ever rotates it and the Dashboard shows a domain as unverified.
