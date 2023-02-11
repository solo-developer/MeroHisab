using MeroHisab.Core.Attributes;
using System.ComponentModel.DataAnnotations;

namespace MeroHisab.Core.Enums
{
    public enum LedgerSetupType
    {
        [Display(Name = "Purchase")]
        [LedgerGroup(LedgerGroupType.Expense)]
        purchase = 1,


        [Display(Name = "Sales")]
        [LedgerGroup(LedgerGroupType.Income)]
        sales,

        [Display(Name = "Sales Return")]
        [LedgerGroup(LedgerGroupType.Expense)]
        sales_return,


        [Display(Name = "Discount Received")]
        [LedgerGroup(LedgerGroupType.Income)]
        discount_received, 


        [Display(Name = "Discount Allowed")]
        [LedgerGroup(LedgerGroupType.Expense)]
        discount_allowed,


        [Display(Name = "Cash")]
        [LedgerGroup(LedgerGroupType.Asset)]
        cash,  


        [Display(Name = "Bank")]
        [LedgerGroup(LedgerGroupType.Asset)]
        bank,  

        [Display(Name = "Tax")]
        [LedgerGroup(LedgerGroupType.Liability)]
        Tax, 

        [Display(Name = "Purchase Return")]
        [LedgerGroup(LedgerGroupType.Income)]
        purchase_return,
        
    }
}
