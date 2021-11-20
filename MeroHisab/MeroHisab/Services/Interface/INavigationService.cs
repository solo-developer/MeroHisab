using MeroHisab.ViewModels;
using Rg.Plugins.Popup.Pages;
using System.Threading.Tasks;

namespace MeroHisab.Services.Interface
{
    public interface INavigationService
    {
        ViewModelBase PreviousPageViewModel { get; }

        Task InitializeAsync();

        Task NavigateToAsync<TViewModel>() where TViewModel : ViewModelBase;

        Task NavigateToAsync<TViewModel>(object parameter) where TViewModel : ViewModelBase;

        Task RemoveLastFromBackStackAsync();

        Task RemoveBackStackAsync();

        Task MoveBack();

        Task ShowLoader(string message="Loading...");

        Task HideLoader();
        Task ShowModal(PopupPage page);
        Task HideModal();
    }
}
