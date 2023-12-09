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
      where: { id: organizationId },
    });
    if (!organization) {
      return res.status(403).json({
        message: `No organization found`,
        data: { organizationId },
        noOrg: true,
      });
    }
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal Error");
  }
};
