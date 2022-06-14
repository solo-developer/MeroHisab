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
    public partial class LoginPage : ContentPage
    {
        public LoginPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<LoginPageModel>();
        }

        private void MaterialButton_Clicked(object sender, EventArgs e)
        {
            var vm= this.BindingContext as LoginPageModel;
            vm.LoginButtonClickedCommand.Execute(null);
        }
    }
}