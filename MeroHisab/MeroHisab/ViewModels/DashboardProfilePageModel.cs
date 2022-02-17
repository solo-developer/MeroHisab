namespace MeroHisab.ViewModels
{
    public class DashboardProfilePageModel : ViewModelBase
    {
        public int SelectedViewModelIndex
        {
            get => GetValue<int>();
            set
            {
                SetValue(value);
            }
        }
    }
}
