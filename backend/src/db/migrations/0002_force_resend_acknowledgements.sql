CREATE TABLE "force_resend_acknowledgements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"acknowledged_by_user_id" uuid NOT NULL,
	"acknowledged_duplicate_risk" boolean NOT NULL,
	"reason" text,
	"send_job_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "force_resend_acknowledgements" ADD CONSTRAINT "force_resend_acknowledgements_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "force_resend_acknowledgements" ADD CONSTRAINT "force_resend_acknowledgements_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "force_resend_acknowledgements" ADD CONSTRAINT "force_resend_acknowledgements_acknowledged_by_user_id_users_id_fk" FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "force_resend_acknowledgements" ADD CONSTRAINT "force_resend_acknowledgements_send_job_id_send_jobs_id_fk" FOREIGN KEY ("send_job_id") REFERENCES "public"."send_jobs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "force_resend_ack_campaign_contact_unique" ON "force_resend_acknowledgements" USING btree ("campaign_id","contact_id");
