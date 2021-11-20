using MeroHisab.Helpers.Interface;
using System.Threading.Tasks;

namespace MeroHisab.Helpers.Implementations
{
    public class NotificationService : INotificationService
    {
        public async Task<string> ShowActionSheet(string title, string cancel, string destruction, params string[] buttons)
        {
           return await App.Current.MainPage.DisplayActionSheet(title, cancel, destruction, buttons);
        }

        public async Task<bool> ShowConfirmationDialog(string title, string message,string confirmationText="OK",string cancelText="Cancel")
        {
            title = string.IsNullOrEmpty(title) ? "XmartCredit" : title;
            return await App.Current.MainPage.DisplayAlert(title, message, confirmationText,cancelText);
        }

        public async Task ShowInfo(string title, string message)
        {
            title = string.IsNullOrEmpty(title) ? "XmartCredit" : title;
            await App.Current.MainPage.DisplayAlert(title, message, "OK");
        }
    }
}
