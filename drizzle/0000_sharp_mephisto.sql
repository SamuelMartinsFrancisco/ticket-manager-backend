CREATE TABLE "issue_category" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issue_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tickets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text,
	"author_id" text NOT NULL,
	"status" integer NOT NULL,
	"category" integer NOT NULL,
	"impact" integer NOT NULL,
	"urgency" integer NOT NULL
);
