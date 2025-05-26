# Perplexity API Updates - 2025

## 🚨 Critical Updates Applied

### **1. Model Names Updated**

**❌ Removed:**
- `sonar-medium` - This model no longer exists

**✅ Updated Available Models:**
- `sonar` - Lightweight, cost-effective search model
- `sonar-pro` - Advanced search model for complex queries  
- `sonar-reasoning` - Fast reasoning model with search
- `sonar-reasoning-pro` - Premier reasoning model with Chain of Thought
- `sonar-deep-research` - Expert-level research model (NEW)
- `r1-1776` - Offline chat model without search (NEW)

### **2. New Features Added**

#### **Search Context Size Control**
- **High**: Maximum depth for complex queries
- **Medium**: Balanced approach (default)
- **Low**: Cost-efficient for straightforward queries

#### **Date Range Filtering**
- Filter search results by specific date ranges
- Uses ISO 8601 format (YYYY-MM-DD)
- Available for all search models

#### **User Location Filtering**
- Filter results based on user location
- Enables localized content retrieval
- Example: "New York, USA"

#### **Image Upload Support**
- Now available for all users (previously restricted)
- Supports multimodal search experiences
- Images can be included in message content

#### **Structured Outputs**
- **JSON Schema**: Available for all models
- **Regex**: Available for `sonar` and `sonar-reasoning` models only
- No longer tier-restricted (available to all users)

### **3. Pricing Changes**

#### **Simplified Billing**
- ✅ Citation tokens are no longer charged
- ✅ All features available to everyone (no tier restrictions)
- ✅ Transparent pricing for input/output tokens

#### **Search Mode Pricing**
Different pricing tiers based on search intensity:
- **Low**: Most cost-effective
- **Medium**: Balanced cost/performance
- **High**: Maximum depth, higher cost

### **4. Files Updated**

#### **src/services/perplexityApi.ts**
- ✅ Updated model types and interface
- ✅ Added new API parameters (search_context_size, date_range_filter, user_location_filter)
- ✅ Added image upload support to Message interface
- ✅ Changed default model from 'sonar-medium' to 'sonar'

#### **src/components/SettingsPanel.tsx**
- ✅ Updated model dropdown with all current models
- ✅ Added search context size selector
- ✅ Added date range filter inputs
- ✅ Added user location filter input
- ✅ Updated structured output descriptions
- ✅ Removed tier restrictions from UI

#### **.env.example**
- ✅ Updated default model from 'sonar-medium' to 'sonar'
- ✅ Added comments listing all available models

### **5. Breaking Changes**

#### **Immediate Action Required**
1. **Update environment variables**: Change `VITE_DEFAULT_MODEL` from `sonar-medium` to `sonar`
2. **Test application**: Verify all functionality works with new model names
3. **Review pricing**: New search modes may affect costs

#### **Deprecated Features**
- `sonar-medium` model is no longer available
- Citation token charges have been removed

### **6. New Capabilities**

#### **Enhanced Search Control**
- Fine-tune search depth vs. cost with context size
- Filter by date ranges for time-sensitive queries
- Localize results with user location filtering

#### **Multimodal Support**
- Upload and analyze images alongside text
- Enhanced visual content understanding

#### **Better Structured Outputs**
- More reliable JSON schema responses
- Regex pattern matching for specific formats
- Available to all users without restrictions

### **7. Recommendations**

#### **For Existing Users**
1. Update your `.env` file with the new default model
2. Test the application thoroughly with new models
3. Consider using search context size to optimize costs
4. Explore new filtering options for better results

#### **For New Features**
1. **Date filtering**: Great for news, research, and time-sensitive queries
2. **Location filtering**: Useful for local business, weather, or regional content
3. **Image uploads**: Enhance queries with visual context
4. **Search context size**: Balance cost vs. thoroughness based on query complexity

### **8. Migration Checklist**

- [x] Update model names in TypeScript interfaces
- [x] Update default settings and environment variables
- [x] Add new API parameters to settings interface
- [x] Update UI components with new options
- [x] Add image upload support to message interface
- [x] Update documentation and comments

### **9. Next Steps**

1. **Test the application** with the updated code
2. **Create a .env file** based on the updated .env.example
3. **Experiment with new features** like date filtering and search context size
4. **Monitor costs** with the new search mode pricing
5. **Consider implementing image upload UI** for enhanced user experience

---

**Last Updated**: January 2025  
**API Version**: Latest (2025)  
**Status**: ✅ All critical updates applied
