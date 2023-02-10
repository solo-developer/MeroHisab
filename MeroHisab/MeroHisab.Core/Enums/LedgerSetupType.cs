using System.ComponentModel.DataAnnotations;

namespace MeroHisab.Core.Enums
{
    public enum LedgerSetupType
    {
        [Display(Name = "Purchase")]
        purchase = 1,
        [Display(Name = "Sales")]
        sales,
        [Display(Name = "Sales Return")]
        sales_return,
        [Display(Name = "Discount Received")]
        discount_received,
        [Display(Name = "Discount Allowed")]
        discount_allowed,
        [Display(Name = "Cash")]
        cash,
        [Display(Name = "Bank")]
        bank,
        [Display(Name = "Tax")]
        Tax,
        [Display(Name = "Purchase Return")]
        purchase_return,
        [Display(Name = "Drawing")]
        drawing_account,
        [Display(Name = "Debtors")]
        Debtors_Group,
        [Display(Name = "Creditors")]
        Creditors_Group
    }
}
