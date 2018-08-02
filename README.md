<p align="center">
  <img height="256px" width="256px" style="text-align: center;" src="https://cdn.rawgit.com/pfbrowning/ng-file-drop/master/demo/src/assets/logo.svg">
</p>

# ng-file-drop - Configurable Angular file input component with cross-browser drag &amp; drop functionality

[![npm version](https://badge.fury.io/js/ng-file-drop.svg)](https://badge.fury.io/js/ng-file-drop),
[![Build Status](https://travis-ci.org/pfbrowning/ng-file-drop.svg?branch=master)](https://travis-ci.org/pfbrowning/ng-file-drop)
[![Coverage Status](https://coveralls.io/repos/github/pfbrowning/ng-file-drop/badge.svg?branch=master)](https://coveralls.io/github/pfbrowning/ng-file-drop?branch=master)
[![dependency Status](https://david-dm.org/pfbrowning/ng-file-drop/status.svg)](https://david-dm.org/pfbrowning/ng-file-drop)
[![devDependency Status](https://david-dm.org/pfbrowning/ng-file-drop/dev-status.svg?branch=master)](https://david-dm.org/pfbrowning/ng-file-drop#info=devDependencies)
[![Greenkeeper Badge](https://badges.greenkeeper.io/pfbrowning/ng-file-drop.svg)](https://greenkeeper.io/)

TODO Correct these

## Introduction
ng-file-drop is an Angular component intended as a drop-in replacement for `<input type="file">` with custom display content, a bindable `dragging` property, cross-browser file drop support, and file size & type checking.

## Motivation
The motivation for this component is to abstract away the following complexities of the native `<input type="file">` and the HTML5 drag & drop functionality:
* The visual customization that's possible on a native `<input type="file">` is extremely limited.  If one wants to display custom content for a file input, such as a styled list of selected files, they must resort to one of [a number of hacks](https://stackoverflow.com/questions/5813344/how-to-customize-input-type-file).
* Setting a ":drag"-like style on an element with children (similar to the CSS :hover selector) also involves resorting to one of [a number of hacks](https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element).  Simply setting a property / style on dragenter and removing it on dragleave will not have the desired effect because the dragenter and dragleave events fire on the child elements as you drag through.
* Modern browsers generally handle the case of the user dragging and dropping a file on a file input seamlessly: you just drop the file on the input and they're automatically selected.  However, in order to achieve similar functionality in IE11, one must cancel the dragover event and pull the files from event.dataTransfer.files within a drop handler.  Even after doing so, you have to get creative and put the files somewhere else, because you can't programmatically put them in the file input due to [security reasons](https://stackoverflow.com/questions/1696877/how-to-set-a-value-to-a-file-input-in-html).
* The "accept" attribute only tells the browser to filter the specified file types within the file selection window.  If you want to actually prevent the user from selecting unsupported filetypes, you have to check it yourself with some simple javascript by checking the file [size](https://stackoverflow.com/questions/3717793/javascript-file-upload-size-validation) and [extension](https://stackoverflow.com/questions/44038559/accept-csv-files-only-via-a-html-file-input).  It's important to note that you should *always* implement server-side validation, because a malicious user can easily circumvent any client-side validations.  The purpose of client-side validation is simply to provide a better user experience, and should *never* be considered a substitute for server-side validation.

## Dependencies
* [Angular](https://angular.io) (*requires* Angular 6 or higher, tested with 6.0.0)

## Installation
Install `@browninglogic/ng-file-drop` via:
```shell
npm install --save @browninglogic/ng-file-drop
```
Then include the imported module in your application module:
```js
import { FileDropModule } from '@browninglogic/ng-file-drop';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [FileDropModule, ...],  
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

## Usage
By design, the component has no display of its own and only displays the content that you place inside it.  To use it, simply place an nfd-file-input component within your template and place the non-interactive content that you want to display inside.  The provided content will be displayed, and clicking anywhere on the component will open the browser's file selection dialog.

Consider this example from the [demo](https://pfbrowning.github.io/ng-file-drop):
```html
<nfd-file-input #fileInput (filesRejected)="onFilesRejected($event)" allowedExtensions="pdf,doc,docx,xls,xlsx,json" [maxFileSize]="4194304">
  <ng-container *ngIf="fileInput.filesSelected; then filesSelected else noFilesSelected"></ng-container>
  <!-- If there are selected files, then show them in a list. -->
  <ng-template #filesSelected>
    <ul class="fileList">
      <li *ngFor="let file of fileInput.selectedFiles">
        {{file['name']}}
      </li>
    </ul>
  </ng-template>
  <ng-template #noFilesSelected>
    <!-- If there are no selected files, then tell the user to either 
    click / drag or to drop, depending on whether files are currently
    being dragged. -->
    <ng-container *ngIf="fileInput.dragging; then dragging else notDragging"></ng-container>
    <ng-template #dragging>Drop Files Here</ng-template>
    <ng-template #notDragging>Click or Drag Files Here</ng-template>
  </ng-template>
</nfd-file-input>
<!-- Show a "Clear Selection" button when files are selected in order to demonstrate the clearSelection functionality.-->
<input type="button" *ngIf="fileInput.filesSelected" (click)="fileInput.clearSelection()" value="Clear Selection" class="clearButton">
```
|Name|Category|Type|Description|
|:---|:---|:---|:---|
|filesSelected|Component Property|Boolean|Denotes whether any files are currently selected.|
|selectedFiles|Component Property|Array<FileRejection>|Exposes an array of the currently selected files.|
|dragging|Component Property|Boolean|Denotes whether the user is currently dragging a file.  Useful for changing the bound content for the duration of the drag.|
|maxFileSize|Optional Input Property|Number|The max file size in bytes to validate for on file selection.|
|allowedExtensions|Optional Input Property|String|A comma-separated list of file extensions to validate on file selection.|
|filesRejected|Event||This event is emitted when allowedExtensions or maxFileSize are specified and the user selects a file which violates either constraint.  It emits an array of file rejections, each of which contains the file itself and an enum stating which constraint the file violated.|
|clearSelection|Method||Clears the current selection|

## Styling
The nfdDragDropHandler class can be used to style the container div.
In addition, the nfdDragging class can be used to apply styles while the
user is dragging files over the component, similar to the CSS hover selector.

Both of the aforementioned classes must be used with the ng-deep combinator.
The ng-deep combinator is necessary in order to specify that styles should be 
applied to child components, such as ng-file-drop.  It's worth noting that ng-deep is
[deprecated](https://angular.io/guide/component-styles#deprecated-deep--and-ng-deep) and is a
[temporary solution](https://hackernoon.com/the-new-angular-ng-deep-and-the-shadow-piercing-combinators-deep-and-drop-4b088dbe459) 
until a better solution becomes clear.  In addition, I would suggest taking a moment to read about 
[view encapsulation](https://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html) 
in Angular if you're not already familiar.

Consider the following example CSS, taken directly from the 
[demo](https://pfbrowning.github.io/ng-file-drop):

```css
/* Apply some simple styles to the container div directly. */
::ng-deep .nfdDragDropHandler {
    cursor: pointer;
    background-color: #e6e6e6;
    border: 1px dashed grey;
    border-radius: 10px;
    padding: 10px 18px;
    text-align: center;
    width:400px;
}

/* Set a light blue background when in a dragging or hovering state */
::ng-deep .nfdDragDropHandler.nfdDragging,
::ng-deep .nfdDragDropHandler:hover
 {
    background-color:lightblue;
}

/* Remove the margin / padding / bullets from the file list */
ul.fileList {
    padding: 0;
    margin: 0;
}

ul.fileList li {
    margin:0;
    list-style:none;
}
```

## Pointer-Events
Since this component is designed to be a drop-in replacement for a file input, it only supports non-interactive display-oriented content.  Pointer-events are disabled on all of the content inside the nfd-file-input component in order to provide consistent "drag" functionality across browsers.  As a side-effect, any pointer-events-based functionality placed inside the component, such as click handlers and :hover selectors, are not supported.  Hover and related CSS selectors can be hooked by using the nfdDragDropHandler CSS class.

## Demo
TODO Publish demo

View it in action here: https://pfbrowning.github.io/ng-file-drop

## Browser Support
The following browsers have been tested and confirmed to be working as of the specified versions:
|Browser|Version|
|:---|:---|
|Firefox|61|
|Chrome|68|
|Opera|54|

I haven't been able to test on Safari for Mac or IOS because I don't own any Macs or IOS devices.  If somebody who does is inclined to report with how it works on either, I would be grateful.

## Documentation
More detailed documentation can be found <a href="http://localhost:8080/index.html">here</a>.

## License

Copyright (c) 2018 Patrick Browning. Licensed under the MIT License (MIT)