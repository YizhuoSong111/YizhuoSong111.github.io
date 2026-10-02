---
title: Regulotype
order: 2
category: Context-dependent genetic regulation
headline: Describing cells through their genetic responses.
summary: I built a single-cell simulation framework to test whether patterns of genetic effects can reveal cellular context.
hook: What if a cellular representation reflected how genetic effects change?
status: Research in progress
context: Statistical Functional Genomics Lab · Columbia
tags: [scDesign2 simulations, SURGE evaluation, Cis-regulatory effects]
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
sources: [CV, SOP, Website specification]
---
## 01. The Question

Can we characterize cellular contexts through heterogeneous genetic effects across variant–gene pairs? Regulotype explores cellular representations built around cross-locus cis-response profiles.

## 02. Why It Matters

Cells are often grouped by expression similarity before their genetic effects are compared. Regulotype asks whether recurrent patterns of cis-regulatory effects can reveal cellular context. Testing this requires separating genetic-response structure from expression similarity in sparse single-cell data.

## 03. The Approach

The simulation framework uses scDesign2 to generate realistic expression data while independently controlling the structure and magnitude of context-dependent genetic effects.

With 200 donors and 500 genes, I evaluated SURGE under null, signal, and shuffled-control settings. These comparisons test whether its latent factors recover shared and context-specific regulatory structure and whether that structure reflects genetic responses beyond expression similarity.

## 04. My Contribution

I developed the single-cell simulation framework, specified the genetic-effect scenarios and controls, and evaluated SURGE's recovery of regulatory structure. The experiments let me examine which inferred factors reflect the genetic effects built into the data.

## 05. What We Found

This work is in progress.

## 06. What It Led Me To Ask

How can these genetic-response patterns help identify cellular contexts relevant to disease? We aim to apply the framework to blood-brain-barrier cell states and identify vascular contexts in which Alzheimer's disease-associated regulatory effects become active.

## 07. Outputs

My research notes explore the conceptual landscape around regulotypes.
