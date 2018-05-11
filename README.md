# epl361.winter17.team14
Development of a News Reader cross platform mobile App, enhanced with hate\toxic filters.

Synopsis
-------------------
The main design pattern of this project is the Client - Server model. The client will consist of the mobile App we develop, which will communicate with the Back-End server of our system to retrieve articles. The Backend server will be used as a crawler to collect the articles which will be sent to the users of our mobile App.

How to Get Started
-------------------
In order to deploy the project on a live system, you will have to install the Mobile App on a smartphone (Android or iOS) and deploy the Back-End on a Node.js environment.
Our app consists of a Front-End and Back-End. The Front-End is a cross-platform mobile app which needs the Back-End service in order to function properly.
The Back-End is a RESTful API service which offers a variety of background services such as storing the articles and sources as well as executing the required queries for the
app to function. The Back-End service is implemented in a nodeJS environment and it can be deployed on any machine that runs the specific platform.

For development purposes we have used the Heroku Service.

The app's APK can be downloaded through the following GitHub link:
https://github.com/CS-UCY-EPL361/eye-reader/blob/master/Prebuild_Mobile_App/EyeReader_Debug.apk

For detailed instructions on how to build the Mobile App, follow the instructions in [Readme.md of the Mobile_App direcory](Mobile_App/README.md)

Contributors
------------
- [Marios Kelepeshis](https://github.com/mkelepe)
- [Constantinos Stylianou](https://github.com/cons-stylianou)
- [Giorgos Hadjidemetriou](https://github.com/ghadji)
- [Antrea Chrysanthou](https://github.com/antreach)
- [Ioannis Giagkou](https://github.com/iyiang)

License
------------
Copyright 2017 LInC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
