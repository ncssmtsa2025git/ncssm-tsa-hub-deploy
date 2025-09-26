// app/models/project.ts
export type ProjectLinkType =
  | "repo"
  | "demo"
  | "slides"
  | "doc"
  | "video"
  | "site"
  | "other";

export interface ProjectLink {
  type: ProjectLinkType;
  label?: string; // optional button text override
  url: string;
}

export interface Project {
  id: string;
  title: string;
  eventName: string;   // TSA event (e.g., "Software Development")
  year: number;        // e.g., 2025
  description: string;
  team?: string[];      // names
  placement?: string;  // e.g., "States – 1st"
  tags?: string[];      // tech/tools keywords
  coverImageUrl?: string;
  links: ProjectLink[]; // repo/demo/docs/slides/etc.
}
