using System;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class LoginPageModel : ViewModelBase
    {
        public IAsyncCommand LoginButtonClickedCommand { get; set; }
        public LoginPageModel()
        {
            LoginButtonClickedCommand = new AsyncCommand(Login,allowsMultipleExecutions:false);
        }

        private async Task Login()
        {
           await _navigationService.NavigateToAsync<MainPageModel>(); 
        }
    }
}
