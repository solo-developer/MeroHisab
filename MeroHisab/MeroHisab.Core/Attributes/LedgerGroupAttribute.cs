using MeroHisab.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace MeroHisab.Core.Attributes
{
    public class LedgerGroupAttribute : Attribute
    {
        public LedgerGroupType GroupType { get; set; }
        public LedgerGroupAttribute(LedgerGroupType type)
        {
            GroupType = type;
        }
    }
}
