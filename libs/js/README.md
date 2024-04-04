# Rx State Utils

Utilities for State Management using RxJS

## Introduction

RxJS is powerful and can be used for state manangement, but everytime I use it in Frontend components I was creating some utils to make it easy to use. I separated those utils and created this library.

## Basic Idea of State Management with RxJS

Components will emit events and will subscribe(or listen) to state changes. Components can also subscribe to features (will explain later).

To react to events emitted by components, we need to convert events to `Observable`. For that `createEvent` function is provided.

## Creating Event

In your class component, you can do below

```ts
searchTextChangeEvent = createEvent<Event, string>(ev => ev.target["value"])
```
