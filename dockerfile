FROM node:20-alpine

RUN mkdir /Investing_Spark
WORKDIR /Investing_Spark

# Copy package files
COPY /project/package*.json /Investing_Spark/

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run 

# Install serve to run the built app
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]