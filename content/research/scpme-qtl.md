---
title: scPME-QTL
order: 1
category: Single-cell statistical genetics
headline: Genetic effects along a cellular continuum.
summary: Pseudobulk analysis can obscure variation between cells; increasingly fine state bins can leave too little information for reliable inference. I developed a mixed-effects framework that works directly with raw counts and continuous cellular states.
hook: The question is not only whether a variant has an effect, but where that effect changes.
status: Manuscript in preparation
context: Gerstein Lab · Yale
tags: [Poisson GLMM, Donor-level reduction, Vectorized score tests]
diagram: regulation
home_story:
  steps:
    - title: Raw UMI counts
      text: Raw counts and continuous cellular states, without first collapsing cells into pseudobulk samples or discrete state bins.
    - title: Gene-level Poisson null GLMM
      text: A Poisson generalized linear mixed model, with a donor-level reduction.
    - title: Vectorized score-test inference
      text: Cis-variant testing under gene-level null models, avoiding a separate alternative-model fit for every variant.
    - title: Static & dynamic cis-eQTLs
      text: Shared effects and effects that change with cellular context.
  metrics:
    - {value: '2.8M+', label: single nuclei}
    - {value: '388', label: donors}
    - {value: '18', label: cell types}
    - {value: '+20.3%', label: unique eGenes}
image: null
image_alt: null
image_caption: null
outputs:
  - label: ISMB 2026 poster
    detail: Identifying Static and Dynamic Single-Cell eQTLs across Human Prefrontal Cortical Layers
    url: null
  - label: Journal manuscript
    detail: In preparation
    url: null
  - label: Code
    detail: Repository link to add
    url: null
sources: [CV, SOP, Website specification]
---
## 01. The Question

How do genetic effects on expression vary across continuous cellular states? I wanted to study both shared effects and effects that change with cellular context without first collapsing cells into pseudobulk samples or discrete state bins.

## 02. Why It Matters

Pseudobulk summaries can erase variation between cells. But making ever finer categories is not a complete solution: sparse single-cell measurements leave less information in each group. The statistical problem is to preserve heterogeneity while retaining enough information for inference.

## 03. The Approach

scPME-QTL models raw UMI counts with a Poisson generalized linear mixed model. A donor-level reduction and vectorized score test allow cis-variant testing under gene-level null models, avoiding a separate alternative-model fit for every variant.

A state-dependent extension tests dynamic eQTLs along continuous cellular states. Donor-level genotype permutations provide calibration, supported by BrainSCOPE-informed simulations and large-scale analyses on Yale's HPC cluster.

## 04. My Contribution

I developed the scPME framework, derived the donor-level reduction and vectorized score test, and extended the model to state-dependent genetic effects. I also built simulation and analysis pipelines to examine calibration and robustness and scale the analysis to millions of nuclei.

## 05. What We Found

After calibration, I applied the framework to **more than 2.8 million nuclei from 388 adult prefrontal cortex samples**. The analysis revealed shared and state-dependent regulatory effects across cellular continua. The work was presented as an ISMB 2026 poster, with a journal manuscript in preparation.

## 06. What It Led Me To Ask

Cellular states are themselves estimated from sparse data. How should their uncertainty propagate into genetic inference? And could the pattern of genetic responses across loci help define a biologically meaningful cellular state?

## 07. Outputs

Z. Chu and I are co-first authors of the ISMB 2026 poster with M. Gerstein.
