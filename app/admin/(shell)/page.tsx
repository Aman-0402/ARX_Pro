import { prisma } from "@/lib/db";
import {
  FileText,
  BadgeCheck,
  Mail,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const [
    blogTotal,
    blogPublished,
    certTotal,
    certValid,
    contacts,
    teamActive,
    portfolioTotal,
  ] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { isValid: true } }),
    prisma.contact.count(),
    prisma.teamMember.count({ where: { active: true } }),
    prisma.portfolioItem.count(),
  ]);

  return {
    blogTotal,
    blogPublished,
    blogDraft: blogTotal - blogPublished,
    certTotal,
    certValid,
    certRevoked: certTotal - certValid,
    contacts,
    teamActive,
    portfolioTotal,
  };
}

async function getRecentContacts() {
  return prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      createdAt: true,
    },
  });
}

export default async function AdminDashboardPage() {
  const [stats, recentContacts] = await Promise.all([
    getStats(),
    getRecentContacts(),
  ]);

  const statCards = [
    {
      label: "Blog Posts",
      value: stats.blogTotal,
      sub: `${stats.blogPublished} published · ${stats.blogDraft} draft`,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Certificates",
      value: stats.certTotal,
      sub: `${stats.certValid} valid · ${stats.certRevoked} revoked`,
      icon: BadgeCheck,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Contact Messages",
      value: stats.contacts,
      sub: "Total form submissions",
      icon: Mail,
      color: "text-gold-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Team Members",
      value: stats.teamActive,
      sub: "Active members",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Portfolio Items",
      value: stats.portfolioTotal,
      sub: "Published projects",
      icon: Briefcase,
      color: "text-navy-900 dark:text-white",
      bg: "bg-gray-100 dark:bg-gray-700",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          ARX Infotech content overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">
              {card.value}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
              {card.label}
            </p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent contacts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-poppins font-semibold text-gray-800 dark:text-white">
            Recent Contact Messages
          </h2>
          <a
            href="/admin/contacts"
            className="text-xs text-gold-400 hover:text-gold-500 font-semibold"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          {recentContacts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">
              No contact messages yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                    Subject
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {c.email}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                      {c.subject}
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
