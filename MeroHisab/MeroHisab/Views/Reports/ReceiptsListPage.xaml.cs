using MeroHisab.ViewModels;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ReceiptsListPage : ContentPage
    {
        public ReceiptsListPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<ReceiptsListPageModel>();
        }
    }
}