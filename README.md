# Music Stream Platform: Muzzi 

A web application for music streaming where creators can host music streams, and users can interact by upvoting, downvoting, and adding to the queue. Only the creator has control over playing the next track, while all users can participate in voting and adding tracks.

## Features

- **Music Stream Creation**: Creators can create a music stream session.
- **Upvote & Downvote**: Users can upvote or downvote queued tracks.
- **Add Music**: Users can add music to the queue.
- **Play Next Control**: Only the creator has the ability to skip to the next track.
- **Link Sharing**: Creators can share a unique stream link for others to join the session.
- **Google Sign-In**: Users can sign in using their Google account for easy access.

## Tech Stack

- **TypeScript**
- **Next.js**: For building the frontend and backend of the application.
- **Prisma**: For managing database models and handling queries.
- **Zod**: For schema validation.
- **PostgreSQL**: For the database.
- **Authentication**: Google Sign-In implemented using `NextAuth`.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/kabhinayak02/muzzi.git
    cd muzzi
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables in `.env`:
    ```
    DATABASE_URL=
    NEXTAUTH_URL=
    NEXTAUTH_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    ```

4. Run database migrations:
    ```bash
    npx prisma migrate dev
    ```

5. Start the application:
    ```bash
    npm run dev
    ```

## Usage

1. **Create a Stream**: After logging in as a creator via Google Sign-In, click on the "Create Stream" button.
2. **Share the Link**: Once the stream is created, share the unique link with other users.
3. **Manage Queue**: Users can upvote, downvote, and add music to the queue. Only the creator has control over skipping to the next track.
4. **Join a Stream**: Users can join a stream using the shared link to participate in the session.