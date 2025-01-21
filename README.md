# Web-Chat

Welcome to the Web-Chat application! This project is a web-based chat platform designed to facilitate real-time communication between users. The application comprises two main components:

1. **Client**: The front-end interface built with modern web technologies.
2. **Server**: The back-end service developed using Node.js and WebSocket for efficient real-time communication.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time messaging between multiple users.
- User-friendly interface for seamless communication.
- Scalable architecture to support numerous concurrent connections.

## Technologies Used

- **Client**: Developed using modern web technologies to ensure responsiveness and compatibility across various devices.
- **Server**: Built with Nestjs, leveraging WebSocket for efficient real-time communication.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (version 14.x or later)
- [npm](https://www.npmjs.com/get-npm) (Node package manager)

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/IsThisHarsh/Web-Chat.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd Web-Chat
   ```

3. **Install dependencies for both client and server**:

   ```bash
   # Install server dependencies
   cd web-chat-server
   npm install

   # Install client dependencies
   cd ../web-chat-client
   npm install
   ```

## Usage

To start the application:

1. **Start the server**:

   ```bash
   cd web-chat-server
   npm start
   ```

   The server will initialize and listen for incoming connections.

2. **Start the client**:

   ```bash
   cd ../web-chat-client
   npm start
   ```

   This will launch the client interface, typically accessible at `http://localhost:3000`.

3. **Access the application**:

   Open your web browser and navigate to `http://localhost:3000` to begin using the chat application.

## Screenshots

Here are some screenshots showcasing the Web-Chat application:

1. **Chat Interface**:

![Chat Interface](https://github.com/IsThisHarsh/images/blob/main/web-chat.png?raw=true)

*Note: Replace the placeholder paths with the actual paths to your screenshot images.*

## Contributing

We welcome contributions to enhance the Web-Chat application. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a pull request detailing your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Thank you for using Web-Chat! If you encounter any issues or have suggestions, please open an issue in the repository. 
