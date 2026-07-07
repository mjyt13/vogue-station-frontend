# General

"Vogue Station" stands for a project where user can choose clothes (parameters of shirts, t-shirts, skirts, pants in future), choose (upload in the future) patterns and color and look how will it look at the mannequin.

Since this is pet project, for developer there is problem to create fullstack applicaction (TS: React & Node.js)

## UI/UX

There should be a draggable window of cloth, panel with pattern, optionally color, sliders for parts, definetely buttons for changing the view (model of cloth/ clothed mannequin). Admin cabinet for moderation, user's cabinet for saving works and choosing for editing. I18n is planned after releasing the common functionality.

## Frontend

There must be an architecture alike big projects so developer could try to imitate the process of creating the valuable product. Patterns like singleton for API, facade similar to barrel export are required. Any constants used to link with the backend are stored in .env file. The framework is React Typescript.

## Backend

Server logic holds RBAC, hashing, auth logic, work with the links to s3 models. MVC architrectur, maybe Factory Method, Abstract Factory patterns are needed.

## DB and S3

The first one (probably postgres) hold data about users (maybe bio, maybe something more accurate about using), S3 storage (MinIO looks pretty heavy, it's good to look for the lighty and fast) contains .glb or more optimal model files made by users to look at them after creating desired one.