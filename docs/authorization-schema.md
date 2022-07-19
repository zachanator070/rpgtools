# Open RPG Tools Permissions

Open RPG Tools is meant to use a combination of role based authorization as well as attribute based authorization. This document is designed to outline this permissioning logic and act as a reference for how this is to be implemented
Examples

A wiki is readable if one of the following:

- The user has the WIKI_READ_ALL permission for that world
- The user has the WIKI_READ permission for that wiki page

A wiki is writeable if one of the following:

- The user has the WIKI_WRITE_ALL permission for that world
- The user has the WIKI_WRITE permission for that wiki page

A user is able to change the permissions for users for wikis if one of the following:

- The user has the WORLD_ADMIN permission for that world

## User Data

User data should be kept on a need to know basis only and should be held as the most valuable information in the system. Authorization around user attributes are determined as defined below.

### Username

All usernames are public to authenticated users

### Email

Emails are pii and are not available to anyone except the user who owns the email, and the system for notifications

### Permissions

The permissions of another user are not available unless the requesting user is an admin of that world.

Ex: a user with the WORLD_ADMIN permission can see all other users and roles that have the WIKI_READ permission

## Roles

Permissions are either directly assigned to a user or assigned through a role.If a user is assigned a role, that user is given the permissions that are assigned to that assigned role. Any number of roles can exist, and each user can be assigned any number of roles.
This design choice was made so that changing permissions for a large user base does not become tedious or repetitive while still allowing flexibility for exceptions without the need to create specific roles that are only assigned to one user.
Permissions are hard coded into the system and can not be changed by the end user. Code changes will be the only way to create, delete, or change the scope of an existing permission.

There exist some special roles that have different behavior and are created by default with every world:

### Owner

- Is granted all permissions
- Cannot be deleted
- Can only be reassigned to one user
- Can be reassigned
- Assigned permissions cannot be changed

### Everyone

- Cannot be deleted
- Assigned permissions can be changed
- Is automatically “assigned” to every user (not actually added to the user object, but is checked with every authorization check)

## Permissions

Permissions are kept track and enforced through a white list, meaning that a user will be granted access to perform an action if they are assigned that permission. There is no list that exists that states that a user does not have a particular permission or isn’t allowed to do something.

List of all permissions by type:

- World
  - WORLD_ADMIN
    - Able to grant or deny other permissions that are assigned to a single user
    - Able to create or delete a role, or change permissions assigned to a role
  - WORLD_READ
    - Able to search for and access a particular world
  - WIKI_READ_ALL
    - Able to read any wiki
  - WIKI_WRITE_ALL
    - Able to create, destroy, or edit any wiki
  - GAME_HOST
    - Able to create and host a game on a world
    - Can assign the GAME_READ or GAME_WRITE permissions to roles or users to created games
- Wiki
  - WIKI_READ
    - Able to read a single wiki article, see it’s images, and see it’s folder structure
  - WIKI_WRITE
    - Able to edit or delete a single wiki article
- Game
  - GAME_READ
    - Able to read a single game, IE join a game and participate
  - GAME_WRITE
    - Able to edit a game, IE change the location or paint to the map
- Server
  - WORLD_CREATE
    - Ability to create and own a world

## Future Features

Some permission features that have been determined not essential at the current time:

- Ability for game hosts to create roles and control those roles to imitate a campaign party
  - This would require game hosts to be able to read all wikis
  - Game host would control only wiki read permissions for that group via a new permission that the game host would be assigned which would point to that role
  - Is a permission role the right mechanism to do this? Or should a new object type be created to keep track of a campaign party?
  - Not sure this is necessary since a game session can easily be the mechanism that keeps track of who is in a party (one game session per party), but then assigning read only permissions to wikis to those in that game session gets kind of messy
- Management scoping
  - Is it too large of a management task for only one permission (world admin) to control roles and assignment of permissions for all users/roles?
  - Would it be better granular control if there were other types of admins? (Wiki, Role, and Game admin)
