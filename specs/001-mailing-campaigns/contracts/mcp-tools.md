# MCP Tools Contract: Mailing Campaigns

All MCP tools enforce the same authorization, validation, rate limiting, and
operator campaign assignment rules as the HTTP API.

## contacts.list

Input: optional `query`, `limit`, `offset`.

Output: paginated contacts with `id`, `email`, `name`, and validation status.

## contacts.create

Input: `email`, optional `name`, optional `personalizationData`.

Output: created contact or validation error. Duplicate email returns a duplicate
error and does not modify the existing contact.

## contacts.update

Input: `id`, editable contact fields.

Output: updated contact or validation/authorization error.

## contacts.delete

Input: `id`.

Output: deletion confirmation or validation/authorization error.

## campaigns.list

Input: optional `status`, `limit`, `offset`.

Output: admins see all campaigns; operators see only assigned campaigns.

## campaigns.create

Input: `name`, `subject`, body content, fallback text, assigned operator.

Output: created draft campaign or validation error.

## campaigns.update

Input: `id`, editable campaign fields.

Output: updated campaign or validation/authorization error. Operators can only
update assigned draft campaigns.

## campaigns.preview

Input: `id`, selected contact IDs.

Output: personalized preview entries, fallback usage, missing data warnings, and
approval requirement.

## campaigns.send

Input: `id`.

Output: queued send job and current campaign status. Requires preview approval.

## campaigns.sendStatus

Input: `id`.

Output: send attempts, job state, recipient outcomes, and recoverable failure
guidance.
