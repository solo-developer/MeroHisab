using MeroHisab.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class PaymentMediumListPage : ContentPage
    {
        public PaymentMediumListPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<PaymentMediumListPageModel>();
        }
    }
}