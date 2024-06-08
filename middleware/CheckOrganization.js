import { Organization } from "../db/db.js";
import moment from "moment";

export const CheckOrganization = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const organizationId = req.user?.organization;
    if (!organizationId) {
      return res.status(403).json({
        message: "No organization found",
        data: { organizationId },
        noOrg: true,
      });
    }
    const organization = await Organization.findOne({
      attributes: [
        "name",
        "address",
        "city",
        "subs",
        "kz_paper_bin",
        "messages",
      ],
      where: { id: organizationId },
    });
    if (!organization) {
      return res.status(403).json({
        message: `No organization found`,
        data: { organizationId },
        noOrg: true,
      });
    }
    req.user.orgData = organization.get({ plain: true });
    if (!req.user.orgData.subs) {
      return res.status(403).json({
        message: `У вас нет активной подписки. Обратитесь к администрации.`,
        data: { organizationId },
        noOrg: true,
        subError: true,
      });
    }
    const subs = JSON.parse(req.user.orgData.subs);
    const latest = subs.reduce((max, current) => {
      return new Date(current.date) > new Date(max.date) ? current : max;
    });
    const expiring_date = moment(latest.date).add(latest.days, "days");
    if (!moment(expiring_date).isAfter(moment())) {
      return res.status(403).json({
        message: `У вас нет активной подписки. Обратитесь к администрации.`,
        data: { organizationId },
        noOrg: true,
        subError: true,
      });
    }
    if (!req.user.orgData.messages) req.user.orgData.messages = 0;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal Error");
  }
};
