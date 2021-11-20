using System.Threading.Tasks;

namespace MeroHisab.Helpers.Interface
{
    public interface INotificationService
    {
        Task ShowInfo(string title,string message);
        Task<bool> ShowConfirmationDialog(string title,string message, string confirmationText = "OK", string cancelText = "Cancel");

        Task<string> ShowActionSheet(string title, string cancel, string destruction, params string[] buttons);
    }
}
