const fs = require('fs');
const path = require('path');

// 1. home.component.ts
const homePath = path.join(__dirname, 'src', 'app', 'public', 'home', 'home.component.ts');
let homeContent = fs.readFileSync(homePath, 'utf8');
if (!homeContent.includes('this.cdr.detectChanges()')) {
    homeContent = homeContent.replace(/console\.log\(this\.vehicles\)/g, 'console.log(this.vehicles);\n        this.cdr.detectChanges();');
    fs.writeFileSync(homePath, homeContent);
    console.log('Fixed home.component.ts');
}

// 2. pretraga-home.component.ts
const pretragaPath = path.join(__dirname, 'src', 'app', 'pretraga', 'pretraga-home', 'pretraga-home.component.ts');
let pretragaContent = fs.readFileSync(pretragaPath, 'utf8');
if (!pretragaContent.includes('ChangeDetectorRef')) {
    pretragaContent = pretragaContent.replace(/import {Component, inject, OnInit} from '@angular\/core';/, "import {Component, inject, OnInit, ChangeDetectorRef} from '@angular/core';");
    pretragaContent = pretragaContent.replace(/cityService=inject\(CityService\);/, "cityService=inject(CityService);\n  cdr = inject(ChangeDetectorRef);");
    pretragaContent = pretragaContent.replace(/this\.loadBookmarks\(\);\r?\n\s*\}/, "this.loadBookmarks();\n        }\n        this.cdr.detectChanges();");
    fs.writeFileSync(pretragaPath, pretragaContent);
    console.log('Fixed pretraga-home.component.ts');
}

// 3. vehicle-listing.ts
const vehiclePath = path.join(__dirname, 'src', 'app', 'vehicle', 'vehicle-listing', 'vehicle-listing.ts');
let vehicleContent = fs.readFileSync(vehiclePath, 'utf8');
if (!vehicleContent.includes('ChangeDetectorRef')) {
    vehicleContent = vehicleContent.replace(/import { Component, ElementRef, OnInit, ViewChild } from '@angular\/core';/, "import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';");
    vehicleContent = vehicleContent.replace(/private chatApi: ChatApiService\r?\n\s*\) \{\}/, "private chatApi: ChatApiService,\n    private cdr: ChangeDetectorRef\n  ) {}");
    vehicleContent = vehicleContent.replace(/console\.log\('Vehicle loaded:', vehicle\);/, "console.log('Vehicle loaded:', vehicle);\n            this.cdr.detectChanges();");
    fs.writeFileSync(vehiclePath, vehicleContent);
    console.log('Fixed vehicle-listing.ts');
}
