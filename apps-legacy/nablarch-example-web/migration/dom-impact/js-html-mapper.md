# JS to HTML Mapper

Generated at: 2026-03-05T02:12:33.814Z

## #topUpdateButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:5`
- scope: `multiple`
- recommendation: `stateful-hook`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 30 id/name: topUpdateButton
  - `src/main/webapp/WEB-INF/view/projectBulk/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectBulkUpdate.html`
    - `button` line 47 id/name: topUpdateButton

## #bottomUpdateButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:6`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 294 id/name: bottomUpdateButton

## #topDeleteButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:9`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 29 id/name: topDeleteButton

## #bottomDeleteButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:10`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 293 id/name: bottomDeleteButton

## #topBackButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:13`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 33 id/name: topBackButton

## #bottomBackButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:14`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 297 id/name: bottomBackButton

## #topSubmitButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:17`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 34 id/name: topSubmitButton

## #bottomSubmitButton (click)
- source: `src/main/webapp/javascripts/projectInput.js:18`
- scope: `single`
- recommendation: `single-component`
- targets:
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `button` line 298 id/name: bottomSubmitButton

## #client-remove (click)
- source: `src/main/webapp/javascripts/projectInput.js:24`
- scope: `multiple`
- recommendation: `stateful-hook`
- targets:
  - `src/main/webapp/WEB-INF/view/common/sidemenu.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewCommonSidemenu.html`
    - `a` line 84 id/name: client-remove
  - `src/main/webapp/WEB-INF/view/project/create.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectCreate.html`
    - `a` line 130 id/name: client-remove
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `a` line 127 id/name: client-remove

## #sortKey (change)
- source: `src/main/webapp/javascripts/projectList.js:8`
- scope: `multiple`
- recommendation: `stateful-hook`
- targets:
  - `src/main/webapp/WEB-INF/view/project/index.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectIndex.html`
    - `select` line 111 id/name: sortKey
  - `src/main/webapp/WEB-INF/view/projectBulk/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectBulkUpdate.html`
    - `select` line 85 id/name: sortKey

## #sortDir (change)
- source: `src/main/webapp/javascripts/projectList.js:8`
- scope: `multiple`
- recommendation: `stateful-hook`
- targets:
  - `src/main/webapp/WEB-INF/view/project/index.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectIndex.html`
    - `select` line 122 id/name: sortDir
  - `src/main/webapp/WEB-INF/view/projectBulk/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectBulkUpdate.html`
    - `select` line 96 id/name: sortDir

## #client-remove (click)
- source: `src/main/webapp/javascripts/projectList.js:16`
- scope: `multiple`
- recommendation: `stateful-hook`
- targets:
  - `src/main/webapp/WEB-INF/view/common/sidemenu.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewCommonSidemenu.html`
    - `a` line 84 id/name: client-remove
  - `src/main/webapp/WEB-INF/view/project/create.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectCreate.html`
    - `a` line 130 id/name: client-remove
  - `src/main/webapp/WEB-INF/view/project/update.jsp` (1 matches)
    - snapshot: `migration/dom-impact/snapshots/SrcMainWebappWEBINFViewProjectUpdate.html`
    - `a` line 127 id/name: client-remove

## #client_pop (click)
- source: `src/main/webapp/javascripts/sideMenu.js:50`
- scope: `none`
- recommendation: `manual-review`
- targets: none

## #clientId (click)
- source: `src/main/webapp/javascripts/sideMenu.js:55`
- scope: `none`
- recommendation: `manual-review`
- targets: none

## #clientName (click)
- source: `src/main/webapp/javascripts/sideMenu.js:55`
- scope: `none`
- recommendation: `manual-review`
- targets: none

## #client_pop (click)
- source: `src/main/webapp/javascripts/sideMenu.js:56`
- scope: `none`
- recommendation: `manual-review`
- targets: none

## .checkbox (change)
- source: `src/main/webapp/javascripts/sideMenu.js:62`
- scope: `none`
- recommendation: `manual-review`
- targets: none
