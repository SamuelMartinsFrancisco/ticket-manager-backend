ALTER TABLE "issue_categories" ADD CONSTRAINT "issue_categories_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "issue_categories" ADD CONSTRAINT "issue_categories_label_unique" UNIQUE("label");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_unique" UNIQUE("id");