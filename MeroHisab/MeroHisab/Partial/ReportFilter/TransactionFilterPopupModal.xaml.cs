using MeroHisab.ViewModels;
using MeroHisab.ViewModels.DefaultAccountSetup;
using Rg.Plugins.Popup.Pages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.ReportFilter
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class TransactionFilterPopupModal : PopupPage
    {
        public TransactionFilterPopupModal(TransactionFilterViewModel model)
        {
            InitializeComponent();
            var vm = App.GetViewModel<TransactionFilterPageModel>();
            BindingContext = vm;
            vm.SetValues(model);
        }
    }
}