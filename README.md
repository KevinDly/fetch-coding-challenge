# Receipt Processor
Created for a coding challenge.
The Challenge: https://github.com/fetch-rewards/receipt-processor-challenge
A Node.JS Rest API for Receipt point tallying.

## How to Run

### With Node.js Installed
This project uses Node.js v18.18.0. To run you must use `node index` in the working directory of the project. The server itself runs on localhost port 3000.

### With Docker
This project also includes a Dockerfile which you can use to build with an image. Alternatively, you can install the image for this project. Before running, the project must have the ports properly connected. `docker run -d -p [REAL_PORT]:3000 [IMAGE-NAME]` must be run where [REAL_PORT] is the port you wish to connect to on your computer and [IMAGE-NAME] is the name of the docker image.

