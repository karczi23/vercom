# MCP Tools Contract: Mailing Campaigns

All MCP tools enforce the same authorization, validation, operator contact
ownership, and operator campaign assignment rules as the HTTP API.

## contacts.list

Input: optional `query`, `limit`, `offset`.

Output: admins receive paginated contacts across operators; operators receive
only their own contacts. Each contact includes `id`, `owningOperatorId`, `email`,
`name`, and validation status.

## contacts.create

Input: `email`, `name`, optional `personalizationData`.

Output: created contact owned by the authenticated operator, or validation
error. Duplicate email for the same operator returns a duplicate error and does
not modify the existing contact; the same email may exist for another operator.

## contacts.update

Input: `id`, editable contact fields.

Output: updated contact or validation/authorization error. Operators can update
only their own contacts.

## contacts.delete

Input: `id`.

Output: deletion confirmation or validation/authorization error. Operators can
delete only their own contacts.

## campaigns.list

Input: optional `status`, `limit`, `offset`.

Output: admins see all campaigns; operators see only assigned campaigns.

## campaigns.create

Input: `name`, `subject`, template content, fallback variables, assigned operator.

Output: created draft campaign or validation error.

## campaigns.update

Input: `id`, editable campaign fields.

Output: updated campaign or validation/authorization error. Operators can only
update assigned draft campaigns.

## campaigns.validateVariables

Input: `id`, selected contact IDs.

Output: variable validation entries, fallback usage, missing data warnings, and
send-readiness approval requirement. Operators can select only contacts they own;
admins can select any contact. EmailLabs performs final placeholder replacement
when sent.

## campaigns.send

Input: `id`.

Output: queued send job and current campaign status. Requires variable validation
approval.

## campaigns.sendStatus

Input: `id`.

Output: send attempts, job state, recipient outcomes, and recoverable failure
guidance.
