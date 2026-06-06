# Research: Campaign Editor

## Decision: Use `pell` for toolbar-controlled rich text editing

**Rationale**: The editor requirements are intentionally small: bold, italic,
heading levels 1-6, predefined fonts, placeholder text, save, preview, and no
future editor growth. A custom editor would spend implementation time on browser
selection and paste behavior. Large editors such as TipTap, ProseMirror, Slate,
Lexical, CKEditor, or TinyMCE add flexibility that this feature does not need.
`pell` is a small WYSIWYG editor with no dependencies and is sufficient for a
bounded toolbar-driven editor.

**Alternatives considered**:
- Custom `contenteditable`: rejected because selection, paste, normalization, and
  browser edge cases would become custom maintenance work.
- Plain `textarea` plus preview: rejected because it is not a true visual editor
  and would expose markup or require a custom mini-format.
- Larger editor frameworks: rejected because they optimize for future extension,
  which the owner explicitly does not expect.

## Decision: Sanitize with DOMPurify and a strict allowlist

**Rationale**: The application stores and previews allowed generated HTML. Even
though raw typed or pasted HTML is unsupported, all saved editor output must be
treated as untrusted input. DOMPurify is a focused sanitizer dependency and
avoids spending feature time maintaining a hand-written HTML sanitizer. Backend
sanitization must use DOMPurify with a Node DOM adapter and enforce the same
allowlist, so client-side sanitization is not trusted as the only defense.

Allowed tags:
- `strong`
- `em`
- `h1`
- `h2`
- `h3`
- `h4`
- `h5`
- `h6`
- `span`
- `p`
- `br`

Allowed attributes:
- `style` only on `span`, restricted to `font-family` with one approved value:
  `Arial`, `Georgia`, `Times New Roman`, or `Verdana`.

**Alternatives considered**:
- Client-only sanitization: rejected because API and MCP clients can bypass the
  browser.
- Custom allowlist parser: rejected because HTML sanitization is security-sensitive
  and a focused dependency is lower risk than maintaining a sanitizer.

## Decision: Store one sanitized template content value

**Rationale**: Feature 001 defines one campaign body format. Spec 002 extends it
by allowing controlled rich-text HTML, not by adding parallel plain-text and HTML
bodies. The stored `templateContent` contains sanitized allowed HTML and
EmailLabs placeholders. EmailLabs performs final placeholder replacement during
sending.

**Alternatives considered**:
- Store separate `bodyText` and `bodyHtml`: rejected because it creates duplicate
  campaign content and conflicts with the one-body-format model.
- Store editor document JSON: rejected because the feature does not need future
  editor portability or complex document transforms.

## Decision: Any syntactically valid placeholder is allowed in the editor

**Rationale**: Operators can type any placeholder using `{{ value }}` syntax.
The editor only validates syntax and preserves tokens. Before send, backend
validation compares placeholders with contact fields, contact
`personalizationData`, and campaign fallback variables. Missing values block
normal send until resolved according to the mailing campaigns feature.

**Alternatives considered**:
- Fixed placeholder catalog: rejected by owner clarification.
- Admin-managed placeholder catalog: rejected because it adds governance and UI
  surface not required for this feature.

## Decision: API contract is a spec-002 delta

**Rationale**: Branch 002 must contain only editor-related changes. The API
contract in this feature therefore documents new or refined endpoints only, and
depends on the feature-001 mailing campaign contract for base campaign/contact
CRUD, authentication, rate limiting, and send job behavior.

**Alternatives considered**:
- Redefine the full campaign API: rejected because it would mix feature-001
  contract ownership into feature 002 and make branch review harder.

## Decision: Force resend uncertain recipients only with explicit acknowledgement

**Rationale**: Automatic recovery must never duplicate a successful or uncertain
submission. The owner prefers possible duplication over possible non-delivery
when an assigned operator explicitly chooses that tradeoff. Force resend is
therefore a separate audited action that requires acknowledgement and enqueues
work asynchronously.

**Alternatives considered**:
- Never resend uncertain recipients: rejected because the owner chose operator
  override.
- Automatic resend on uncertainty: rejected because it violates duplicate
  prevention for automated recovery.
