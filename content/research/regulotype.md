---
title: Regulotype
order: 2
category: Context-dependent genetic regulation
headline: Describing cells through their genetic responses.
summary: I develop statistical models of cell-resolved cis-regulatory effect profiles, asking whether patterns of genetic response across loci can describe cellular context.
hook: What if a cellular representation reflected how genetic effects change?
status: Research in progress
context: Statistical Functional Genomics Lab · Columbia
tags: [Latent factor models, Cis-response profiles, Empirical Bayes]
diagram: profiles
image: null
image_alt: null
image_caption: null
outputs:
  - label: Regulotype research notes
    detail: Conceptual landscape around regulotypes
    url: https://yizhuosong111.github.io/regulotype-notes/
  - label: Code
    detail: Repository link to add
    url: null
sources: [CV, Website specification]
---
## 01. The Question

Can we characterize cellular contexts through heterogeneous genetic effects across variant–gene pairs? Regulotype explores cellular representations built around cross-locus cis-response profiles.

## 02. Why It Matters

Genetic regulation depends on context. Studying the structure of those responses offers a way to ask which cells share regulatory behavior and where that behavior differs, while confronting the sparsity of single-cell measurements.

## 03. The Approach

The model uses low-rank latent factors to jointly learn cellular regulatory coordinates and variant-specific effect loadings. Pooling information across cells and independent cis-regulatory regions supports estimation of cell-resolved effect profiles.

Covariate-moderated empirical Bayes regularization stabilizes effect estimation in sparse data. Simulation, model development, and conceptual analysis are part of the research direction.

## 04. My Contribution

I developed statistical methods for cell-resolved cis-regulatory effect profiles, implemented the low-rank latent factor models, and applied covariate-moderated empirical Bayes regularization to characterize context-dependent regulatory heterogeneity.

## 05. What We Found

This work is in progress.

## 06. What It Led Me To Ask

How can we distinguish a reproducible genetic-response structure from patterns introduced by sparse measurement or model assumptions? I want to connect these representations to uncertainty-aware genetic inference.

## 07. Outputs

My research notes explore the conceptual landscape around regulotypes.
