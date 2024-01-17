import { Organization } from "../db/db.js";

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
      attributes: ["name", "address", "city", "kz_paper_bin"],
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
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal Error");
  }
};
