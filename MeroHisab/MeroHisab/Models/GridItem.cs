using System;

namespace MeroHisab.Models
{
    public class GridItem
    {
        public string IconName { get; set; }
        public string DisplayName { get; set; }

        public Type NavigationViewModelType { get; set; }
    }
}
