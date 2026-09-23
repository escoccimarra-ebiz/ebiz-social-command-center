# Meta Integration

This package must consume imported Meta events only. It must not hold real Meta secrets in Git or publish/reply externally in MVP1.

Current scope:

- Normalize Meta-style message and comment webhooks.
- Verify HMAC signatures at the boundary.
- Return internal Social Inbox events only.
- Never send, publish, reply, or auto-reply.
