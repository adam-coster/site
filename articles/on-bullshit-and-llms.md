---
kind: article
title: On Bullshit and Generative AI
description: Bullshit is an indifference to the truth, a fundamental property of
  generative AI via Large Language Models (LLMs). Can bullshit ever be converted
  into truth?
publishedAt: 2025-02-03T02:13:19.653Z
tags:
  - philosophy
  - llm
  - ai
crossPosts: []

---

Decades ago, Harry G. Frankfurt wrote an essay entitled "On Bullshit" (expanded to [a book by the same title](https://press.princeton.edu/books/hardcover/9780691122946/on-bullshit) in 2005), where he explores the philosophy of what makes something "bullshit" rather than a _lie_. I'd summarize the takeaway like this:

> A statement is "bullshit" if it is made independently of whether or not it is true.

An honest person claims to be true what they believe to be true. A liar claims to be true what they believe to be false. A bullshitter claims something to be true independent of what they believe.

This makes "bullshit" about _indifference to_ truth, not whether or not a statement is actually true.

This definition squarely encapsulates the content created by Large Language Models (LLMs) and other "generative AI" tech. The function and purpose of these technologies is to generate the next _most likely_ sequence of data, given a prior sequence of data. "Most likely" is defined not in relationship to _truth_, merely to _probability given the training set_.

Whether an LLM spits out something true or false is entirely independent of its purpose and design. An LLM is, definitionally, a Bullshit Machine. And it's not that LLMs sometimes "hallucinate", it's that _every single output is bullshit_ (indifferent to its truth). It's just that sometimes (even _often_!), that bullshit _just so happens to be true_.

Notably, even if an LLM's training set were composed entirely of _factually correct_ data (an impossible task), that would not transmute the meaning of "most probable next sequence of data" into "factually correct statement". But the LLMs being sold to us are the worst case scenario: they're trained on data with _complete indifference_ to whether or not that data reflects truth (they're trained on every piece of written text their creators can get a hold of). In other words, LLMs are Bullshit Machines trained on bullshit.

So... what _possible_ use cases could there be for such a machine?

1. **When bullshit is the point.** Generating propaganda, burying the internet in SEO slop, generating scam content, etc. The reason that the internet has filled to the brim with LLM bullshit is that this use case is, by far, the best fit to purpose.
2. **When truth rates are high _and_ are verifiable by the user.** So falseness can be detected and corrected, but is rare enough that the overall effort is worthwhile. The best example here, in my opinion, is code generation for programmers: code is more concrete than natural language, there are low incentives to publish code that doesn't work (so training sets contain a lot of "truth"), code can be functionally evaluated by running it, and users are fairly likely to have significant domain knowledge. Despite all of that working in favor of LLMs to be successful for this use case, any programmer will tell you that they're a mixed bag. And they are fundamentally limited to always being a mixed bag.
3. **When bullshit can be converted into truth.** This is the holy grail of LLMs, since it would allow the use of generated content even when its truth cannot be evaluated by the user. But just as the laws of reality prevented alchemists of yore from converting lead into gold, it will prevent the technologists of tomorrow from turning bullshit into truth.
