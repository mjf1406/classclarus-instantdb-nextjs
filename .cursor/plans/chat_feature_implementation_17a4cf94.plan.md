---
name: Chat Feature Implementation
overview: Implement a full-featured chat system with direct messages, group channels, typing indicators, read receipts, file attachments, reactions, search, and notifications - accessible via sidebar and dedicated pages at both class and organization levels.
todos:
  - id: schema-update
    content: Add chat entities and links to instant.schema.ts
    status: pending
  - id: perms-update
    content: Add chat permission rules to instant.perms.ts
    status: pending
    dependencies:
      - schema-update
  - id: class-settings
    content: Add classSettings entity with chat toggle
    status: pending
    dependencies:
      - schema-update
  - id: chat-provider
    content: Create ChatProvider context for state management
    status: pending
  - id: use-can-message
    content: Create useCanMessage hook for permission checks
    status: pending
    dependencies:
      - perms-update
  - id: conversation-list
    content: Build ConversationList component for DMs
    status: pending
  - id: channel-list
    content: Build ChannelList component for group channels
    status: pending
  - id: message-thread
    content: Build MessageThread with message display and scroll
    status: pending
    dependencies:
      - chat-provider
  - id: message-input
    content: Build MessageInput with file upload support
    status: pending
    dependencies:
      - message-thread
  - id: new-conversation-dialog
    content: Build dialog to start new DM conversations
    status: pending
    dependencies:
      - use-can-message
  - id: new-channel-dialog
    content: Build dialog to create group channels
    status: pending
    dependencies:
      - use-can-message
  - id: typing-indicator
    content: Implement typing indicators using InstantDB rooms
    status: pending
  - id: read-receipts
    content: Implement read receipt tracking and display
    status: pending
  - id: reactions
    content: Implement emoji reactions on messages
    status: pending
  - id: search-dialog
    content: Build message search functionality
    status: pending
  - id: notification-badge
    content: Build unread count badge component
    status: pending
  - id: chat-sidebar
    content: Integrate chat section into app sidebar
    status: pending
    dependencies:
      - conversation-list
      - channel-list
      - notification-badge
  - id: class-chat-page
    content: Create /class/[orgId]/[classId]/chat page
    status: pending
    dependencies:
      - message-thread
      - conversation-list
      - channel-list
  - id: org-chat-page
    content: Create /org/[orgId]/chat page
    status: pending
    dependencies:
      - message-thread
      - conversation-list
      - channel-list
  - id: class-settings-page
    content: Create settings page with chat toggle
    status: pending
    dependencies:
      - class-settings
  - id: parent-inbox
    content: Build read-only parent inbox for viewing child messages
    status: pending
    dependencies:
      - message-thread
---

# Chat Feature Implementation Plan

## Architecture Overview

```mermaid
flowchart TB
    subgraph ui [UI Layer]
        Sidebar[Chat Sidebar Section]
        ClassPage["/class/.../chat"]
        OrgPage["/org/.../chat"]
        ParentInbox[Parent Child Inbox]
    end
    
    subgraph components [Reusable Components]
        ConvoList[ConversationList]
        ChannelList[ChannelList]
        MessageThread[MessageThread]
        MessageInput[MessageInput]
        TypingIndicator[TypingIndicator]
        ReadReceipts[ReadReceipts]
        ReactionPicker[ReactionPicker]
        SearchDialog[SearchDialog]
    end
    
    subgraph data [Data Layer]
        InstantDB[(InstantDB)]
        Presence[Rooms/Presence]
        Storage[File Storage]
    end
    
    ui --> components
    components --> data
```



## Schema Changes

Add these new entities to [`instant.schema.ts`](src/instant.schema.ts):**Entities:**

- `chatConversations` - Direct message threads (1-on-1 or small groups)
- `chatChannels` - Group channels within classes/orgs
- `chatMessages` - Messages with content, timestamps, attachments
- `chatReactions` - Emoji reactions on messages
- `classSettings` - Class-level configuration including chat toggle

**Key Links:**

- Messages linked to conversations OR channels
- Messages linked to author
- Conversations linked to participants and optionally class/org
- Channels linked to class or org
- Read receipts tracked per user per conversation/channel

## Permission Rules

Update [`instant.perms.ts`](src/instant.perms.ts) with chat-specific rules:| Entity | Create | View | Update | Delete ||--------|--------|------|--------|--------|| chatConversations | Participants only | Participants only | Participants | Owner only || chatChannels | Teachers/admins/owner | Class/org members | Creator/admin | Creator/admin || chatMessages | Conversation/channel member | Member or parent of participant | Author only | Author only || chatReactions | Anyone who can view message | Anyone who can view message | Author | Author |**Special permission: Parent read-only access** - Parents can view messages where their child is a participant, but cannot send messages to those conversations.

## Component Structure

Create reusable components in [`src/components/chat/`](src/components/chat/):

```javascript
chat/
  index.ts                    # Public exports
  chat-provider.tsx           # Context for chat state
  conversation-list.tsx       # List of DM conversations
  channel-list.tsx            # List of group channels
  message-thread.tsx          # Message display with scroll
  message-item.tsx            # Individual message bubble
  message-input.tsx           # Input with file upload
  typing-indicator.tsx        # "X is typing..." display
  read-receipts.tsx           # Seen/delivered indicators
  reaction-picker.tsx         # Emoji reaction selector
  reaction-display.tsx        # Show reactions on messages
  new-conversation-dialog.tsx # Start DM with eligible users
  new-channel-dialog.tsx      # Create group channel
  search-dialog.tsx           # Search messages
  chat-sidebar-section.tsx    # Sidebar integration
  parent-inbox.tsx            # Read-only child message view
  notification-badge.tsx      # Unread count badge
  hooks/
    use-conversations.ts      # Query conversations
    use-messages.ts           # Query messages with pagination
    use-typing.ts             # Typing indicator logic
    use-can-message.ts        # Permission checks for who can message whom
```



## Pages

**Class Chat Page:** `src/app/class/[orgId]/[classId]/chat/page.tsx`

- Full chat interface for class context
- Shows channels and DMs relevant to the class

**Org Chat Page:** `src/app/org/[orgId]/chat/page.tsx`

- Chat interface for organization context
- Shows org-level channels and DMs

**Class Settings Update:** Add chat toggle to `src/app/class/[orgId]/[classId]/settings/page.tsx`

- Toggle to enable/disable student chat
- Managed by class teachers/admins/owner

## Messaging Permission Matrix

| Sender | Can Message ||--------|-------------|| Parent | Teachers, admins, owner of child's class; org owner/admins || Student | Teachers, admins of class (if chat enabled) || Class Teacher | Anyone in class; org teachers/admins/owner || Class Admin | Owner, other admins, teachers of class || Class Owner | Admins, teachers of class || Org Admin | Owner, other admins, teachers of all classes in org |

## Real-time Features

Using InstantDB rooms for ephemeral data:

- `chat-typing-{conversationId}` - Typing indicators per conversation
- `chat-presence-{classId}` / `chat-presence-{orgId}` - Online status

## Implementation Phases

This is a large feature - recommend implementing in phases:

1. **Phase 1 (Core):** Schema, permissions, basic DMs, message thread
2. **Phase 2 (Channels):** Group channels, channel creation