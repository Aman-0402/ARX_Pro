export type FieldType = "text" | "textarea" | "number" | "checkbox" | "date" | "datetime";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ResourceConfig {
  key: string;
  label: string;
  endpoint: string;
  columns: string[];
  fields: FieldConfig[];
  readOnly?: boolean;
}

export const ADMIN_RESOURCES: ResourceConfig[] = [
  {
    key: "blog",
    label: "Blog Posts",
    endpoint: "/api/content/blog/",
    columns: ["title", "category", "author", "published"],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "cover_image", label: "Cover Image URL", type: "text" },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "tags", label: "Tags", type: "text" },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "published_at", label: "Published At", type: "datetime" },
    ],
  },
  {
    key: "certificates",
    label: "Certificates",
    endpoint: "/api/content/certificates/",
    columns: ["certificate_id", "holder_name", "course_name", "is_valid"],
    fields: [
      { name: "certificate_id", label: "Certificate ID", type: "text", required: true },
      { name: "holder_name", label: "Holder Name", type: "text", required: true },
      { name: "course_name", label: "Course Name", type: "text", required: true },
      { name: "issue_date", label: "Issue Date", type: "datetime", required: true },
      { name: "expiry_date", label: "Expiry Date", type: "datetime" },
      { name: "is_valid", label: "Valid", type: "checkbox" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    endpoint: "/api/content/clients/",
    columns: ["name", "website", "order", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo", label: "Logo URL", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "contacts",
    label: "Contact Submissions",
    endpoint: "/api/content/contacts/",
    columns: ["name", "email", "subject", "created_at"],
    fields: [],
    readOnly: true,
  },
  {
    key: "portfolio",
    label: "Portfolio",
    endpoint: "/api/content/portfolio/",
    columns: ["title", "category", "featured", "order"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "content", label: "Content", type: "textarea" },
      { name: "image", label: "Image URL", type: "text" },
      { name: "tags", label: "Tags", type: "text" },
      { name: "client_name", label: "Client Name", type: "text" },
      { name: "live_url", label: "Live URL", type: "text" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    key: "pricing",
    label: "Pricing Plans",
    endpoint: "/api/content/pricing/",
    columns: ["name", "price", "highlight", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text", required: true },
      { name: "price", label: "Price", type: "text", required: true },
      { name: "period", label: "Period", type: "text", required: true },
      { name: "badge", label: "Badge", type: "text" },
      { name: "badge_variant", label: "Badge Variant", type: "text" },
      { name: "highlight", label: "Highlight", type: "checkbox" },
      { name: "features", label: "Features", type: "textarea", required: true },
      { name: "button_label", label: "Button Label", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "services",
    label: "Services",
    endpoint: "/api/content/services/",
    columns: ["title", "icon", "order", "active"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "icon", label: "Icon Key", type: "text" },
      { name: "image", label: "Image URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    endpoint: "/api/content/stats/",
    columns: ["label", "target", "suffix", "order"],
    fields: [
      { name: "icon", label: "Icon Key", type: "text" },
      { name: "target", label: "Target", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "team",
    label: "Team Members",
    endpoint: "/api/content/team/",
    columns: ["name", "role", "order", "active"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photo", label: "Photo URL", type: "text" },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
      { name: "twitter", label: "Twitter URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    endpoint: "/api/content/testimonials/",
    columns: ["name", "company", "stars", "order"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "text", label: "Testimonial Text", type: "textarea", required: true },
      { name: "stars", label: "Stars", type: "number" },
      { name: "avatar", label: "Avatar URL", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  {
    key: "social-links",
    label: "Social Links",
    endpoint: "/api/content/social-links/",
    columns: ["platform", "label", "order", "active"],
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "order", label: "Order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
];

export function getResourceConfig(key: string): ResourceConfig | undefined {
  return ADMIN_RESOURCES.find((resource) => resource.key === key);
}
