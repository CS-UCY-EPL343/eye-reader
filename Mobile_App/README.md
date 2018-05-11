# Mobile App
A Mobile App developed using web technologies, such as HTML, CSS and Javascript, which are compiled to hybrid mobile app using the the Corvova toolset, which wraps our HTML/JavaScript app into a native container which can access the device functions of several platforms. These functions are exposed via a unified JavaScript API, allowing us to easily write one set of code to target nearly every phone or tablet on the market today and publish to their app stores.

## How to Get Started

1) Install Node.js (with NPM)  
2) Install Android Studio  
3) Install Cordova  
4) Build for android using cordova CLI  

### Install Node.js (with NPM)
- Navigate to [Node.js Homepage](https://nodejs.org) and download the latest installer for your system (e.g. Node.js 8.9.1 LTS for Windows x64)

- Run the installation and follow the wizard using the recommended  parameters

### Install Android Studio
- Navigate to [Android Studio's Homepage](https://developer.android.com/studio/index.html) and download the latest installer for your system (e.g. Android Studio  3.0.1 for Windows)

- Run the installation and follow the wizard using the recommended  parameters

### Install Cordova
- Open a command prompt or Terminal, and type  
```
$ npm install -g cordova
```

### Build for android using cordova CLI
- Create a blank Cordova project using the command-line tool. Navigate to the directory where you wish to create your project and type cordova create <path>.  
```
$ cordova create EyeReader
```

- Now you have to navigate to EyeReader folder and find a folder named 'www'. Delete everything inside the folder 'www' and copy all the contets of Mobile_App directory of this repository.

- After creating a Cordova project and replacing the contents of the 'www' folder, navigate to the project directory. From the project directory, you need to add a platform for which you want to build your app.

 To add a platform, type cordova platform add <platform name>.

 For a complete list of platforms you can add, run cordova platform.  
```
$ cd EyeReader
```  
```
$ cordova platform add android
```

- To build for a specific platform, type cordova build <platform name>.  
```
$ ionic cordova build android
```

- If the build process finishes successfully, the .apk file will be located inside  
```
/EyeReader/platforms/android/build/outputs/apk
```

## Alternative way to preview the app in a browser

- Download the Mobile_App directory of this repository on your desktop computer  

- Navigate to  
```
/Mobile_App/
```
- Open a command prompt or Terminal, and type  
```
$ ionic serve
```
- Navigate to /localhost/ using Chrome

- Press F12 to open the developer perspective

- Press [Ctrl + Shift+ M] to Toggle the device toolbar and choose 'Nexus 5X' as the device