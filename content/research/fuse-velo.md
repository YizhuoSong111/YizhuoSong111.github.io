---
title: FUSE-Velo
order: 3
category: RNA velocity & cellular dynamics
headline: A snapshot can have more than one future.
summary: Different kinetic parameters can fit the same observed snapshot and imply different cellular trajectories. I developed a framework that uses future cell populations to constrain those possible dynamics.
hook: What does a later population reveal that a single snapshot cannot?
status: Research in progress
context: Gerstein Lab · Yale
tags: [Kinetic ODE rollout, Sinkhorn optimal transport, Identifiability]
diagram: dynamics
image: null
image_alt: null
image_caption: null
outputs:
  - label: Manuscript / research notes
    detail: Output details to add
    url: null
  - label: Code
    detail: Repository link to add
    url: null
sources: [CV, SOP, Website specification]
---
## 01. The Question

When different kinetic parameters explain the same snapshot, what additional information can distinguish their implied dynamics? FUSE-Velo investigates whether observed future populations can constrain RNA-velocity inference.

## 02. Why It Matters

A good fit to observed counts does not necessarily identify a unique cellular trajectory. If compatible parameter settings lead to different futures, interpreting one fitted trajectory requires understanding that ambiguity.

## 03. The Approach

The framework combines kinetic ODE forward simulation with a Sinkhorn optimal-transport loss. It rolls a predicted population forward and aligns its distribution with an observed future cell population.

The evaluation compares kinetic-parameter estimation and future-state prediction against VELOVI and VeloVAE. Synthetic and real-data validation are part of the project scope.

## 04. My Contribution

I developed the future-state-constrained framework, integrated ODE forward simulation with Sinkhorn distribution matching, and benchmarked kinetic-parameter estimation and future-state prediction against the baseline methods.

## 05. What We Found

This work is in progress.

## 06. What It Led Me To Ask

Which temporal observations resolve which ambiguities? I also want to understand how uncertainty in inferred dynamics should carry through to downstream analyses of genetic regulation.

## 07. Outputs

Research in progress.
