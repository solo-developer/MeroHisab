using System;
using System.Collections.Generic;
using System.Text;

namespace MeroHisab.Core.Enums
{
    public enum LedgerSetupType
    {
        purchase=1,
        sales,
        sales_return,
        discount_received,
        discount_allowed,
        cash,
        bank,
        Tax,
        purchase_return,
        drawing_account,
        Debtors_Group,
        Creditors_Group
    }
}
